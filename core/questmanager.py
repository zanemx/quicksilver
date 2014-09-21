#!/usr/bin/env python
from core.basehandler import BaseHandler
from core.p12utils import *
from xml.etree import ElementTree
from google.appengine.api import urlfetch
from google.appengine.ext import ndb
from core.models import ChainQuest,Quest
import os
import re
# import dropbox
# from pprint import pprint
# # import huTools

# # logging.info(dropbox)
# app_key = 'mrnx63g2yrbqrrb'
# app_secret= '38fk5qed8k6hg4h'


class QuestManager(BaseHandler):
	def get(self):
		self.post()

	def post(self):
		self.response.headers['Access-Control-Allow-Origin'] = '*'
		action = self.request.get('action')

		self.res = self.getResponse()

		if action:
			func = getattr(self,action)()
		else:
			self.res['error'] = 'no action'

		if self.res['error'] is not None:
			self.res['success'] = False

		self.res['__action__'] = action
		self.response.out.write(p12Encoder.encode(self.res))

	def getChains(self):
		q = ChainQuest.query()
		
		chains = []
		for c in q:
			qq = Quest.query(ancestor=c.key)
			chain = c.toDict()
			chain['quests'] = [x.toDict() for x in qq]
			chains.append(chain)

		self.res['chains'] = chains

	def parse(self):

		# file = open(self.request.get('filename'), 'w+')
		# return
		#load xml file
		filename = self.request.get('filename')

		# url = os.path.abspath(os.path.join(os.path.dirname(__file__),'..','quicksilver/static/app/xml/',filename))
		# for k,v in os.environ.iteritems():
			# logging.info(k)
			# logging.info(v)
		proto = 'http://' if os.environ['HTTPS'] == 'off' else 'https://'
		url = os.path.join(proto,os.environ['HTTP_HOST'],'static/app/xml/',filename)

		# fetch url
		result = urlfetch.fetch(url)

		# create xml element
		xml = ElementTree.fromstring(result.content)
		npc = xml.find('npc').text

		# remove all chains from this npc
		q = ChainQuest.query(ChainQuest.location == npc)

		# delete quests from chain
		for c in q:[x.delete() for x in c.quests]

		# remove chain quests
		[x.key.delete() for x in q]

		chains = xml.findall('chain')
		
		i = 0
		for chain in chains:
			self._parseChain(npc,chain,i)
			i+=1

	def _parseChain(self,npc,c,chainIndex):

		name = c.find('title').text
		start = c.find('start').text
		end = c.find('end').text
		
		# create or update chain model entity in datastore
		chainKey = ndb.Key("ChainQuest",self._asKey(name))
		chain = ChainQuest(key=chainKey)
		chain.name = self._asKey(name)
		chain.startDescription = start
		chain.endDescription = end
		chain.location = npc
		chain.dungeon = chain.name
		chain.chainIndex = chainIndex

		# parse and add quests to chain
		i = 0
		for q in c.findall('quest'):
			qTitle = q.find('title').text
			qDescription = q.find('desc').text

			# keyName = "%s_%s_%s" % (npc,name,qTitle)
			key = ndb.Key('Quest',qTitle,parent=chain.key)
			quest = Quest(key=key)
			quest.name = qTitle
			quest.description = qDescription
			quest.action = 'do quest'
			quest.questType = 'strength'
			quest.complete = False
			quest.percentDone = 0.0
			quest.percentTotal = 100.0
			quest.quest_chain_id = i
			quest.put()

			chain.addQuest(key)

			i+=1

		chain.put()

	def _asKey(self,keyid):

		# remove multiple spaces and replace with single space. Strip trailing whitespace
		r = re.sub( '\s+', ' ',keyid).strip()

		# capitalize each word 
		r = ' '.join([x.capitalize() for x in r.split()])
		return r


	def getResponse(self):
		return {
			'error':None,
			'success':True,
		}