#!/usr/bin/env python
import webapp2
import json
from models import *
import logging
from google.appengine.ext import db
# from google.appengine.api import channel
from p12utils import *
from datetime import datetime
from forge import *
import os
import re
import random
import math
import map
from dungeons import getDungeonList
import questdetails
import talents
from mobs import getRandomMob
from gear import grantRandomItem
from copy import copy
from constants import *
from battle import Battle


MOCO = {
	'authtoken':'g2f39ckuq8vo|ydfmn',
	'goldsecret':'Pa9f89L2',
}


class Ajax(webapp2.RequestHandler):

	def get(self):
		self.post()

	def post(self):
		# self.response.headers['Access-Control-Allow-Origin'] = '*'
		action = self.request.get('action')

		# GET AND SET TOON 
		toonkey = self.request.get("toonkey")
		if toonkey:
			self.toon = ndb.Key(urlsafe=toonkey).get()

		self.res = self.getResponse()

		if action:
			func = getattr(self,action)()
		else:
			self.res['error'] = 'no action'

		if self.res['error'] is not None:
			self.res['success'] = False

		self.res['__action__'] = action
		self.response.out.write(p12Encoder.encode(self.res))

		if hasattr(self,'toon'):
			if self.toon:
				if self.toon.isDirty:
					self.toon.isDirty = False
					self.toon.put()

	# def pushNotification(self):
	# 	channel.send_message(self.name,json.loads({
	# 			'content':content
	# 		}))

	#////////////////////////////////////////////////////
	def resetDungeon(self):
		name = self.request.get('name')
		dungeon = PatchDungeon.query(ancestor=self.toon.key).filter(PatchDungeon.name == name).get()
		dungeon.key.delete()
		self.getDungeonList()


	def getFeedback(self):
		q = Feedback.query().order(-Feedback.created)
		self.res['feedback'] = [x.content for x in q]

	def leaveFeedback(self):
		m = self.request.get('message')
		body = '%s%s' % ('<a href="http://quicksilver-p12.appspot.com/feedback">VIEW FEEDBACK. </a>',m)
		

		Feedback(
			user=self.toon.key,
			content=m,
			created=datetime.now()
			).put()

		from google.appengine.api import mail
		mail.send_mail(
			sender="zanemx@gmail.com",
			to="zanemx@gmail.com,caleb.garner@gmail.com",
			subject="Quicksilver Feedback",
			body=body)


	def sellResource(self):
		_type = self.request.get('type')
		if self.toon.resources[_type] > 0:

			ah = self.getAuctionHouse()
			price = ah.getMarketValue(_type)

			self.toon.resources[_type] -= 1

			self.toon.addGold(price)

			self.toon.isDirty = True

			self.res['resources'] = self.toon.resources
			self.res['gold'] = self.toon.gold

			ah.addItem(_type)

		else:
			self.res['error'] = "You don't have that to sell."

	def getAuctionHouse(self):
		key = ndb.Key('AuctionHouse','ah')
		ah = key.get()
		if not ah:
			ah = AuctionHouse(key=key)
			ah.put()
		return ah


	def buyResource(self):
		_type = self.request.get('type')
		ah = self.getAuctionHouse()
		price = ah.getMarketValue(_type)

		if not ah.hasItem(_type):
			self.res['error'] = 'sold out'
			return

		if self.toon.gold >= price:
			self.toon.gold -= price
			self.toon.resources[_type] += 1
			ah.removeItem(_type)
			self.toon.isDirty = True
			self.res['auctionHouse'] = ah.toDict()
			self.res['gold'] = self.toon.gold
			self.res['resources'] = self.toon.resources

		else:
			self.res['error'] = ERROR_NOT_ENOUGH_GOLD

	def getAuction(self):
		self.res['auctionHouse'] = self.getAuctionHouse().toDict()

	def craftItem(self):
		index = int(self.request.get('index'))
		item = self.toon.recipes['recipes'][index]
		# TODO validate resources to make item

		if 'ore' in item:
			if item['ore'] > self.toon.resources['ore']:
				self.res['error'] = 'not enough resources'
			else:
				self.toon.resources['ore'] -= item['ore']
				self.toon.isDirty = True

		if 'leather' in item: 
			if item['leather'] > self.toon.resources['leather']:
				self.res['error'] = 'not enough resources'
			else:
				self.toon.resources['leather'] -= item['leather']
				self.toon.isDirty = True

		if 'herbs' in item:
			if item['herbs'] > self.toon.resources['herbs']:
				self.res['error'] = 'not enough resources'
			else:
				self.toon.resources['herbs'] -= item['herbs']
				self.toon.isDirty = True

		# logging.info(self.res['error'])

		if not self.res['error']:
			self.toon.addInventoryItem(item)
			self.res['item']=item


	def _grantResource(self):
		r=random.randrange(0,100)
		if r>5: #5% drop rate
			return

		r=random.randrange(0,3)
		amount = self.toon.level
		resource = 'ore'
		if r == 0:resource = 'herbs'
		elif r == 1:resource = 'leather'

		# apply profession ability modifier
		prof = {
			'skinning':'leather',
			'mining':'ore',
			'hebalism':'herbs',
			None:''
		}[self.toon.profession]

		if prof == resource:
			amount *= 3
		#add to toon
		self.toon.resources[resource] += amount
		self.toon.isDirty = True

		self.res['resource'] = (resource,amount)


	def regenerateRecipes(self):
		self.toon.updateRecipes()
		self.res['recipes'] = self.toon.recipes

	def setProfession(self):
		profession = self.request.get('profession')
		self.toon.profession = profession
		self.toon.isDirty = True
		
	def stepDungeon(self):

		if not self.toon.spendEnergy(1):
			self.res['error'] = ERROR_OUT_OF_ENERGY
			return

		name = self.request.get("name")
		dungeon = PatchDungeon.query(ancestor=self.toon.key).filter(PatchDungeon.name == name).get()

		self.doDungeonFight(dungeon)

		view = dungeon.toDict()
		view['me'] = self.toon.toDict()
		self.res['view'] = view

	def doDungeonFight(self,dungeon):

		me = self.toon.toDict()
		mob = dungeon.progression[dungeon.progression_index]
		from battle import Battle
		battle = Battle(me,mob).toDict()

		# rewards = {
		# 	'gold':1,
		# 	'exp':1,
		# 	'items':[]
		# }

		rewards = self.createReward()
		rewards['gold'] = 1
		rewards['exp'] = 1
		
		if battle['winner'] == me['name']:

			rewards['gold'] = battle['p2']['level']*10
			rewards['exp'] = battle['p2']['level']*10

			item = createItemByLevelAndGrade(battle['p2']['level'],battle['p2']['grade'])
			rewards['items'].append(self.toon.addInventoryItem(item))

			# advance this dungeon
			if dungeon.progression_index < len(dungeon.progression):
				dungeon.progression_index += 1
			else:
				# grand some loot man!
				dungeon.complete = True
				rewards['gold'] *= 10
				rewards['exp'] *= 10
			
			dungeon.put()

		self.toon.tickBuff()
			
		battle['rewards'] = rewards

		self.toon.addGold(rewards['gold'])
		self.toon.addExp(rewards['exp'])
		self.toon.isDirty = True

		self.res['battle'] = battle

	def createReward(self,gold=-1,exp=-1,essence=-1,energy=-1,items=None):
		return {
			'gold':max(gold,0),
			'exp':max(exp,0),
			'essence':max(essence,0),
			'energy':max(energy,0),
			'items':(items if items is not None else [])
		}


	def getDungeon(self):
		name = self.request.get("name")
		dungeon = PatchDungeon.query(ancestor=self.toon.key).filter(PatchDungeon.name == name).get()
		# if not dungeon:
		# 	dungeon = PatchDungeon(parent=self.toon.key)
		# 	dungeon.create(name)
		
		view = dungeon.toDict()
		view['me'] = self.toon.toDict()
		self.res['party'] = self.toon.getParty()
		self.res['view'] = view

	def getDungeonList(self):
		dungeons = self.toon.unlocked_dungeons
		q = PatchDungeon.query(ancestor=self.toon.key)
		active = [d.toDict() for d in q]
		_dun = [d for d in dungeons if d not in [x['name'] for x in active]]
		self.res['active_dungeons'] = active
		self.res['dungeons'] = _dun

	def setupDungeon(self):
		dungeon_name = self.request.get('name')
		difficulty = self.request.get('difficulty')

		dungeon = PatchDungeon(parent=self.toon.key)
		dungeon.create(dungeon_name=dungeon_name,difficulty=difficulty)

		self.getDungeonList()
		
		# view = dungeon.toDict()
		# view['me'] = self.toon.toDict()
		# self.res['party'] = self.toon.getParty()
		# self.res['view'] = view

	def getFriendToonsByMocoID(self):
		toons = []
		mocoid = self.request.get('mocoid')
		key = ndb.Key('User',mocoid)
		user = key.get()
		if user:
			q = Toon.query(ancestor=key)
			toons = [x.name for x in q]
		self.res['toons'] = toons

	def regenerateMarketView(self):
		view = self.request.get('view').lower()
		self.toon.updateMarketView(view)
		self.res['market'] = self.toon.market

	def getGuilds(self):
		self.res['guilds'] = [g.toDict() for g in Guild.query()]

	def deleteQuest(self):
		key = ndb.Key("Quest",self.request.get("name"))
		# remove from chain
		q = ChainQuest.query(ChainQuest.quests.IN([key]))
		chain = q.get()
		if chain:
			chain.removeQuest(key)
		key.delete()

	def deleteChain(self):
		key = ndb.Key("ChainQuest",self.request.get("name"))
		key.delete()

	def editChain(self):
		name = self.request.get("name")
		# logging.info(self.request.get("start"))
		key = ndb.Key("ChainQuest",self._asKey(name))
		chain = key.get()
		if not chain:
			chain = ChainQuest(key=key)
			chain.chainIndex = ChainQuest.query().filter(ChainQuest.location == self.request.get('location')).count()

		chain.name = self._asKey(name)
		chain.startDescription = self.request.get("start")
		chain.endDescription = self.request.get("end")
		chain.location = self.request.get("location")

		# set chain level based on location
		view = getattr(map,chain.location)()
		chain.level = view.level

		chain.dungeon = chain.name#self.request.get("dungeon")
		chain.put()

		self.getQuestMakerView()

	def _asKey(self,keyid):

		# remove multiple spaces and replace with single space. Strip trailing whitespace
		r = re.sub( '\s+', ' ',keyid).strip()

		# capitalize each word 
		r = ' '.join([x.capitalize() for x in r.split()])
		# logging.info(r)
		return r

	def editQuest(self):
		name = self.request.get('name')
		key = ndb.Key("Quest",self._asKey(name))
		quest = key.get()
		if not quest:
			quest = Quest(key=key)

		quest.name = self._asKey(name)
		quest.description = self.request.get('description')
		quest.action = self.request.get('questAction')
		quest.questType = self.request.get("questType")
		quest.complete = False
		quest.percentDone = 0.0
		quest.percentTotal = 100.0

		quest_chain_id = self.request.get('quest_chain_id')

		
		if hasattr(quest,'quest_chain_id'):

			if quest.quest_chain_id != quest_chain_id:
				# remove from old chain quest entity 
				chainKey = ndb.Key('ChainQuest',quest.quest_chain_id)
				chain = chainKey.get()
				if chain:
					chain.removeQuest(key)

		quest.quest_chain_id = quest_chain_id
		chainKey = ndb.Key('ChainQuest',quest_chain_id)
		chain = chainKey.get()
		chain.addQuest(key)

		quest.quest_link_id = int(self.request.get("quest_link_id"))
		quest.put()


		#check for other quests with same link id
		quests = ndb.get_multi(chain.quests)
		_sorted = sorted(quests,key=lambda x: x.quest_link_id)
		length = len(_sorted)
		i = 0

		ordered = []
		while i < length:
			a = _sorted[i].quest_link_id
			b = -1
			if i < length - 1:
				b = _sorted[i+1].quest_link_id

				# check which is the new one and swap them
				if a == b:
					if _sorted[i].name != quest.name:
						_sorted[i+1],_sorted[i] = _sorted[i],_sorted[i+1]

			ordered.append(_sorted[i])
			i+=1

		for i in range(0,len(ordered)):
			q = ordered[i]
			q.quest_link_id = i+1

		ndb.put_multi(ordered)
		self.getQuestMakerView()

	# def deleteQuest(self):
	# 	name = self.request.get('name')
	# 	key = ndb.Key("Quest",name)
	# 	key.delete()


	def getQuestMakerView(self):
		q = Quest.query()
		self.res['quests'] = [quest.toDict() for quest in q]

		q = ChainQuest.query()
		self.res['chainQuests'] = [cq.toDict() for cq in q]

		result = [(n,c) for n,c in map.__dict__.items() if isinstance(c,type)]
		locations = []
		for i in result:
			l = i[0]
			if l=='Paralelliea' or l == 'DungeonPlace' or l == 'NPCPlace' or l == 'Place' or l == 'RedForest':continue
			locations.append(l)


		self.res['dungeons'] = getDungeonList()
		self.res['locations'] = locations



	def getAllToonNames(self):
		# cursor = self.request.get('cursor')
		# startsWith = self.request.get("startsWidth")

		q = Toon.query().order(Toon.name)
		names = q.fetch(projection=[Toon.name])
		_names = [n.name for n in names]
		_names.remove(self.toon.name)
		self.res['names'] = _names


	def getParty(self):
		party = self.toon.getParty()
		self.res['party'] = party

	def addPartyMember(self):
		newMember = Toon.getByName(self.request.get("name"))
		if not newMember:
			self.res['error'] = 'no player by that name'
			return
		oldMemeber = Toon.getByName(self.request.get("oldMember"))

		self.toon.addPartyMember(newMember,oldMemeber)

		self.getParty()



	def getGuild(self):
		name = self.request.get('name')
		guild = ndb.Key('Guild',name).get()
		self.res['guild'] = guild.toDict()
		
	def kickMember(self):
		guild = ndb.Key('Guild',self.request.get('name')).get()
		guild.removeMemeber(self.request.get("playerToKick"))
		player = Toon.getByName(self.request.get('playerToKick'))

		Alert(
			parent=player.key,
			title="Kicked",
			content="You have been kicked from %s" % (guild.name),
			actions=['dismiss']
			).put()
	def leaveGuild(self):
		guild = ndb.Key('Guild',self.request.get('name')).get()
		guild.removeMemeber(self.toon.name)
		Alert(
			parent=guild.leader,
			title="Player Left Guild",
			content="%s has left %s" % (self.toon.name,guild.name),
			actions=['dismiss']
			).put()


	def getMyGuildView(self):
		guilds = []
		q = Guild.query().filter(Guild.members.IN([self.toon.name]))
		for guild in q:
			guilds.append(guild.toDict())
		self.res['guilds'] = guilds

	def inviteToGuild(self):

		player = Toon.getByName(self.request.get("name"))

		if not player:
			self.res['error'] = 'no player by that name.'
			return

		guild = ndb.Key('Guild', self.request.get("guildName")).get()
		if not guild:
			self.res['error'] = 'no guild by that name.'
			return

		if player.name in guild.members:
			self.res['error'] = '%s is already a member.' % (player.name)
			return

		leader = guild.leader.get()

		Alert(
			parent=player.key,
			title="Guild invite from %s" % (leader.name),
			content="%s has invited you to %s." % (leader.name,guild.name),
			actions=['refuse','accept'],
			type='guildInvite',
			extra=guild.key.urlsafe()
			).put()

	def applyToGuild(self):
		name = self.request.get("name");

		key = ndb.Key('Guild',name)
		guild = key.get()
		leader = guild.leader.get()

		Alert(
			parent=leader.key,
			title=  "%s wants to join %s." % (self.toon.name,guild.name),
			content="%s wants to join %s." % (self.toon.name,guild.name),
			actions=['refuse','accept'],
			type='guildApply',
			extra=self.toon.key.urlsafe()
			).put()


	def createGuild(self):

		key = ndb.Key('Guild',self.request.get("name"))
		guild = key.get()
		if not guild:
			guild = Guild(key=key)
			guild.name = self.request.get('name')
			guild.leader = self.toon.key
			guild.members.append(self.toon.name)
			guild.put()
			self.res['guild'] = guild.toDict()
		else:
			self.res['error'] = 'guild already exists'

	def disbandGuild(self):
		key=ndb.Key("Guild",self.request.get('name'))
		guild = key.get()
		if self.toon.key == guild.leader:
			key.delete()
		else:
			self.res['error'] = "permission denied"

	def doAlertAction(self):
		key = ndb.Key(urlsafe=self.request.get('key'))
		alert = key.get()
		action = self.request.get("alertAction").lower()

		# logging.info(action)

		if alert.type == 'general' or alert.type == 'duel':
			if action == 'dismiss':
				key.delete()
		elif alert.type == 'guildInvite':
			guild = ndb.Key(urlsafe=alert.extra).get()
			if action == 'accept':

				guild.addMember(self.toon.name)

				# remove alert
				key.delete()

				self.res['guild']=guild.toDict()

				# alert the guild
				Alert(
					parent=guild.leader,
					title="Guild Invite Accepted",
					content="Guild invite accepted from %s putting your guild at %i members." % (self.toon.name, len(guild.members)),
					actions=['dismiss'],
					type='general'
					).put()

			elif action == 'refuse':
				Alert(
					parent=guild.leader,
					title="Guild Invite Refused",
					content="Guild invite refused from %s" % (self.toon.name),
					actions=['dismiss'],
					type='general'
					).put()
				key.delete()

		elif alert.type == 'guildApply':

			# guild = ndb.Key(urlsafe=alert.extra).get()
			guild = Guild.query().filter(Guild.leader == self.toon.key).get()
			player = ndb.Key(urlsafe=alert.extra).get()

			if action == 'accept':

				guild.addMember(player.name)
				
				Alert(
					parent=player.key,
					title="Welcome to %s!" % (guild.name),
					content="Your request for membership has been accepted. Congratulations!",
					actions=['dismiss'],
					type='general'
					).put()
				key.delete()

			elif action =='refuse':
				Alert(
					parent=player.key,
					title="Guild Request Refused",
					content="Guild request refused from %s" % (guild.name),
					actions=['dismiss'],
					type='general'
					).put()
				key.delete()

	def addSkillPoint(self):
		attr = self.request.get('attribute').lower()
		if self.toon.skillpoints > 0:
			current = getattr(self.toon,attr)
			# logging.info(current)
			setattr(self.toon,attr,current+1)
			self.toon.skillpoints -= 1
			self.toon.isDirty = True

			# recalculate stats
			self.res['calculated'] = self.toon.calculated

	def characterFetchAttribs(self):
		attribs = json.loads(self.request.get("attributes"))
		self.res['attribs'] = {}
		for a in attribs:
			self.res['attribs'][a] = getattr(self.toon,a)


	# def characterSaveAttribs(self):
	# 	attribs = json.loads(self.request.get("attributes"))
	# 	for a in attribs:
	# 		setattr(self.toon,a,v)

	def getUser(self):
		keyid = self.request.get("userid")
		key = ndb.Key('User',keyid)
		user = key.get()
		if not user:
			user = User(key=key)
			user.put()
		self.res['user'] = user.toDict()

	def getToon(self):
		key = ndb.Key(urlsafe=self.request.get('key'))
		toon = key.get()
		if not toon:
			return None
		self.res['toon'] = self.toon.toDict()

	def getCharacterList(self):
		toons = []
		key = ndb.Key(urlsafe=self.request.get('keyid'))
		q = Toon.query(ancestor=key)
		for toon in q:
			toons.append(toon.toDict())
		self.res['toons'] = toons




	

	


	def toggle_didLevelUp(self):
		self.toon.didLevelUp = False
		self.toon.isDirty = True

	def getTalents(self):
		trees = talents.getTalentTrees(self.toon.level)
		self.res['trees'] = trees

	def doExplore(self):
		view = self._getView(self.toon.mapview)

		if not self.toon.spendEnergy(1):
			self.res['error'] = ERROR_OUT_OF_ENERGY
			return

		self.res['result'] = ''

		exp = view.level * random.randrange(2,10)
		gold = view.level * random.randrange(2,10)
		

		

		# CALCULATE CHANCE TO DO BATTLE
		r = random.randrange(0,100)
		if r > 98:
			# grant random loot 
			item = grantRandomItem(self.toon)
			self.res['gear'] = self.toon.addInventoryItem(item)

			results = [
				"You trip over a large brownish mushroom and find %s " % (item['name']),
				"Your exploration in %s has not been in vain. You find %s " % (view.name,item['name'])
			]
			self.res['result'] = results[random.randrange(0,len(results))]

		elif r > 73:
			self.toon.tickBuff()
			battle = Battle(self.toon.toDict(),getRandomMob(view.level))
			self.res['battle'] = battle.toDict()

			if battle.winner == self.toon.name:
				results = [
					"You battle to near death and barely kill the horrid moster with your own life near to death."
				]
				self.res['result'] = results[random.randrange(0,len(results))]

				r2 = random.randrange(0,100)
				if r2 > 74:
					# grant random loot 
					item = grantRandomItem(self.toon)
					self.res['gear'] = self.toon.addInventoryItem(item)

					results = [
						"You battle to near death and barely kill the horrid moster with your own life near to death. You loot %s from the moster." % (item['name'])
					]
					self.res['result'] = results[random.randrange(0,len(results))]

			else:
				results = [
					"The battle was wicked. You barely escape with your life retreating from where you came."
				]
				self.res['result'] = results[random.randrange(0,len(results))]


		else:
			# check for more exits
			visibleExits = view.visibleExits
			exits = view.exits

			discoverable_exits = [x for x in exits if x not in visibleExits]
			if len(discoverable_exits)>0:

				exit = discoverable_exits[0]#random.randrange(0,len(discoverable_exits))]

				# require user to win battle to expose area
				# level needs to be the level of the exit your going for
				ViewClass = getattr(map, exit['name'].replace(' ',''))
				_exitView = ViewClass()
				battle = Battle(self.toon.toDict(),getRandomMob(_exitView.level))
				self.res['battle'] = battle.toDict()
				
				if battle.winner == self.toon.name:
					# expose new area
					view.visibleExits.append(exit)
					self.res['found'] = exit


					results = [
						"You battle to near death and barely kill the horrid moster with your own life near to death. You slowly rise and look around. You've discovered %s." % (exit['name'])
					]
					self.res['result'] = results[random.randrange(0,len(results))]

					view.put()

				else:
					results = [
						"The battle was wicked. You barely escape with your life retreating from where you came."
					]
					self.res['result'] = results[random.randrange(0,len(results))]

				self.toon.tickBuff()

			else:
				results = [
					"You trip over a large brownish mushroom and nearly pass out from the smell. Or you hit your head to hard! OUCH!",
					"Your exploration was nothing more than a sunday stroll in the forest."
				]
				self.res['result'] = results[random.randrange(0,len(results))]


		if 'battle' in self.res:
			logging.info(self.res['battle']['winner'])
			if self.res['battle']['winner'] != self.toon.name:
				gold = 0
				exp = 0

		self.toon.addExp(exp)
		self.toon.addGold(gold)

		self.res['exp'] = exp
		self.res['gold'] = gold

		self._grantResource()
		self.res['map'] = view.toDict()


	# returns instance of PatchView with all static view attributes attached
	def _getView(self,mapview):
		mapview = mapview.replace(" ","")
		ViewClass = getattr(map,mapview)
		view = ViewClass().toDict()

		# logging.info(PatchView.query().count())
		key = ndb.Key('PatchView',view['name'],parent=self.toon.key)
		patchView = key.get()
		if not patchView:
			patchView = PatchView(key=key)	
			patchView.createFromView(view)

		# check for updates 
		if len(patchView.chains) != len(view['chains']):
			patchView.chains = view['chains']
			patchView.put()
			logging.info('update available')


		# TODO calculate progress of area
		
		return patchView

	def getMapView(self):
		newView = self.request.get("view")
		view = self._getView(newView)
		self.res['map'] = view.toDict()
		self.toon.lastmapview = self.toon.mapview
		self.toon.mapview = newView
		self.toon.isDirty = True

	def doDuel(self):

		if not self.toon.spendEnergy(1):
			self.res['error'] = ERROR_OUT_OF_ENERGY
			return

		self.res['result'] = ''

		exp = 0
		gold = 0
		
		self.toon.tickBuff()
		key = ndb.Key(urlsafe=self.request.get('enemy_keyid'))
		enemy = key.get()
		battle = Battle(self.toon.toDict(),enemy.toDict()).toDict()

		winner = enemy
		loser = self.toon
		
		if battle['winner'] == self.toon.name:
			winner = self.toon
			loser = enemy

			results = [
				"You fought with valor and beat %s ." % (enemy.name)
			]
			self.res['result'] = results[random.randrange(0,len(results))]

			gold = battle['p2']['level']*10
			exp = battle['p2']['level']*10

			# random overflow loot
			# item = enemy.getRandomOverflowItem()
			# logging.info(item)
			# if(item):
			# 	self.res['gear'] = self.toon.addInventoryItem(item)

			self.toon.addExp(exp)
			self.toon.addGold(gold)

		else:
			results = [
				"You fought with valor but lost the fight against %s" % (enemy.name)
			]
			self.res['result'] = results[random.randrange(0,len(results))]

			enemy_gold = battle['p1']['level']*10
			enemy_exp = battle['p1']['level']*10

			enemy.addExp(enemy_exp)
			enemy.addGold(enemy_gold)

			# random overflow loot
			# item = self.toon.getRandomOverflowItem()
			# logging.info(item)
			# if(item):
			# 	self.res['gear'] = enemy.addInventoryItem(item)

			enemy.put()

			a = Alert(
				parent=enemy.key,
				title="You Won!",
				content="Congratulations you have beaten %s in a duel! You've been rewarded %i gold and %i exp." % (self.toon.name,enemy_gold,enemy_exp),
				actions=['dismiss']
				)
			a.put()
			enemy.doPushNotification(a,'duel')
			

		self.toon.isDirty = True

		self.res['exp'] = exp
		self.res['gold'] = gold
		self.res['battle'] = battle

	def getBattle(self):
		view = self._getView(self.toon.mapview)

		if not hasattr(view,'level'):
			# get radom level 
			level = random.randrange(1,11)
			view.level = level

		self.res['map'] = view.toDict()
		dToon = self.toon.toDict()
		
		# check if enemy in request
		enemy_keyid = self.request.get('enemy_keyid')
		if enemy_keyid:
			key = ndb.Key(urlsafe=enemy_keyid)
			dEnemy = key.get().toDict()
			mob = {
				'name':dEnemy['name'],
				'level':dEnemy['level'],
				'intelligence':dEnemy['calculated_intelligence'],
				'strength':dEnemy['calculated_strength'],
				'endurance':dEnemy['calculated_endurance'],
				'defense':dEnemy['calculated_defense'],
				# 'damage':dEnemy['calculated_damage'],
				'life':100.0
			}
		else:
			mob = getRandomMob(view.level)
			mob['life'] = 100.0

		me = {
			'name':dToon['name'],
			'level':dToon['level'],
			'intelligence':dToon['calculated']['intelligence'],
			'strength':dToon['calculated']['strength'],
			'endurance':dToon['calculated']['endurance'],
			'defense':dToon['calculated']['defense'],
			# 'damage':dToon['calculated']['damage'],
			'life':100.0
		}

		meta = {}
		battle = []
		attacking = random.randrange(0,10) < 5

		# CALC DAMANGE 
		meDamage = me['intelligence'] + me['strength'] + me['defense'] + me['endurance']
		mobDamage = mob['intelligence'] + mob['strength'] + mob['defense'] + mob['endurance']
		meMod = float(meDamage) / float(mobDamage) * 0.1
		mobMod = float(mobDamage) / float(meDamage) * 0.1
		me['damage'] = meDamage + (meDamage * meMod)
		mob['damage'] = mobDamage + (mobDamage * mobMod)
		# logging.info(me['damage'])
		# logging.info(mob['damage'])

		meta['me'] = me
		meta['mob'] = mob

		while me['life'] > 0 and mob['life'] > 0:
			
			offence = mob
			defense = me
			if attacking:
				offence = me
				defense = mob

			attacking = not attacking
			damage = offence['damage']

			# APPLY RANDOM +- 30% to damage
			accuracy = 30
			damage += (damage * random.randrange(accuracy) - accuracy*0.5) * 0.01

			defense['life'] -= damage

			battle.append({'me':copy(me),'mob':copy(mob),'meta':{
				'damage':damage,
				'attacker':offence['name']
			}})

		meta['winner'] = me['name'] if me['life'] > 0 else mob['name']

		# apply loot
		if meta['winner'] == me['name']:
			item = grantRandomItem(self.toon,mob['level'])
			newItem = InventoryItem()
			for k,v in item.iteritems():
				setattr(newItem,k,v)
			newItem.put()
			self.toon.addInventoryItem(item)
			# self.toon.isDirty=True
			meta['loot'] = [item]
		
		self.res['battle'] = battle
		self.res['battleMeta'] = meta

	def _getPatchQuest(self,quest):
		key = ndb.Key("Quest",quest.name,parent=self.toon.key)
		patchQuest = key.get()
		return patchQuest

	def doMatch2Quest(self):
		first = self.request.get('first')
		second = self.request.get('second')
		view = self._getView(self.toon.mapview)
		reward = view.advanceMatch2Questing(first,second)
		if reward:
			# logging.info(reward)fff
			# {u'index': 11, u'rewardKey': u'gold', u'matched': True}
			# grant reward
			if reward['rewardKey'] == 'gold':
				reward['value'] = self.toon.level * 10
				self.toon.addGold(reward['value'])
			elif reward['rewardKey'] == 'essence':
				reward['value'] = 1
				self.toon.addEssence(reward['value'])
			elif reward['rewardKey'] == 'energy':
				reward['value'] = 1
				self.toon.addEnergy(reward['value'])
			elif reward['rewardKey'] == 'exp':
				reward['value'] = self.toon.level * 10
				self.toon.addExp(reward['value'])
			else:
				item = createItemFromClassName(self.toon,reward['rewardKey'])
				self.toon.addInventoryItem(item)
				self.toon.isDirty = True
				reward['item'] = item
				# some type of armor / weapon reward dude
				# get 

			self.res['reward'] = reward
		else:
			self.toon.spendEnergy(1)
			self.res['error'] = 'no match'

		self.toon.isDirty = True

	def doFinishMatch2Quest(self):
		view = self._getView(self.toon.mapview)
		view.finishQuest()
		self.res['view'] = view.toDict()

	def doQuest(self):
		view = self._getView(self.toon.mapview)

		quest = view.getQuest()
		if not quest:return

		updates = []
		if self.toon.energy > 0:

			self.toon.energy -= 1

			# TODO calculate using Calebs formula
			pcent = (max(self.toon.gearscore,10) / self.toon.gearcap) * (float(self.toon.level) / float(view.level))
			pcent = pcent * 100

			# calculate gold amount 
			gold = int(self._calcGoldReward() * 0.2)
			exp = int(max(self._calcExp() * 0.2,1))

			roll = {
				'essence':[],
				'gold':[],
				'hit':[],
				'exp':[],
				'energy':[]
			}

			# do roll 
			r1 = random.randrange(0,100)
			r2 = random.randrange(0,100)
			r3 = random.randrange(0,100)
			# r1=r2=r3 =0

			if r1 < pcent:
				roll['hit'].append("%.1f%%" % (pcent))
			else:
				r = random.randrange(0,100)
				if r==100:
					roll['essence'].append(1)
				elif r>89:
					roll['energy'].append(1)
				elif r>69:
					roll['gold'].append(gold)
				else:
					roll['exp'].append(exp)

			if r2 < pcent:
				roll['hit'].append("%.1f%%" % (pcent))
			else:
				r = random.randrange(0,100)
				if r==100:
					roll['essence'].append(1)
				elif r>89:
					roll['energy'].append(1)
				elif r>69:
					roll['gold'].append(gold)
				else:
					roll['exp'].append(exp)
			if r3 < pcent:
				roll['hit'].append("%.1f%%" % (pcent))
			else:
				r = random.randrange(0,100)
				if r==100:
					roll['essence'].append(1)
				elif r>89:
					roll['energy'].append(1)
				elif r>69:
					roll['gold'].append(gold)
				else:
					roll['exp'].append(exp)

			self.res['roll'] = roll

			quest['percentDone'] += pcent * len(roll['hit'])

			# gold
			self.toon.gold += sum(roll['gold'])
			self.toon.energy += sum(roll['energy'])
			self.toon.exp += sum(roll['exp'])

			essence = sum(roll['essence'])
			if essence>0:
				self.toon.user.essence += essence
				updates.append(self.toon.user)

			# quest COMPLETE
			if quest['percentDone'] >= 100:
				quest['complete'] = True


			updates.append(view)
			updates.append(self.toon)

		ndb.put_multi(updates)
		
		self.res['percentDone'] = quest['percentDone']
		self.res['complete'] = quest['complete']
		self.res['toon']  = self.toon.toDict()
		# logging.info(self.res['toon']['didLevelUp'])

	def doFinishChain(self):
		view = self._getView(self.toon.mapview)
		unlocked_dungeon = view.finishChain()
		self.toon.unlocked_dungeons.append(unlocked_dungeon)
		self.toon.isDirty = True

		# alert
		a = Alert(
			parent=self.toon.key,
			title="Dungeon Unlocked!",
			content="Congratulations you have unlocked %s!" % (unlocked_dungeon),
			actions=['dismiss']
			)
		a.put()
		self.toon.doPushNotification(a,'Dungeon Unlocked!')

	def doFinishQuest(self):
		view = self._getView(self.toon.mapview)
		quest = view.getQuest()
		rewards = []
		if quest:
			if quest['complete'] == True:

				# grand random item
				item = grantRandomItem(self.toon,view.level)
				rewards.append(item.toDict())
				# quest.reward.append(item.toDict())
				# self.res['item'] = item.toDict()

				for item in rewards:
					self.toon.addInventoryItem(item['id'])

				gold = self._calcGoldReward()
				self.toon.gold += gold
				self.res['gold'] = gold
				
				self.res['essence'] = 0

				# if quest.essence > 0:
				# 	self.toon.user.essence += quest.essence
				# 	self.res['essence'] = quest.essence
				# 	self.toon.user.put()

				self.toon.skillpoints += 1
				self.res['skillpoints'] = 1

				# self.toon.energy += quest.energy
				# self.res['energy'] = quest.energy

				exp = self._calcExp()
				self.toon.exp += exp
				self.res['exp'] = exp

				view.finishQuest()

			self.toon.isDirty = True

		self.res['rewards'] = rewards
		self.res['toon']  = self.toon.toDict()

	def _calcGoldReward(self):
		reward = 10
		mod = 1.1
		for i in range(1,self.toon.level):
			reward = reward * mod 
			# logging.info(reward)
		return math.ceil(reward)

	def _calcExp(self):
		reward = 10
		mod = 1.1
		for i in range(1,self.toon.level):
			reward = reward * mod 
		return int(max(math.ceil(reward),1))

	def createNewToon(self):
		# logging.info(self.request.get("userid"))
		parentKey= ndb.Key(urlsafe=self.request.get('userid'))
		# logging.info(parentKey)
		toonKey =ndb.Key('Toon',self.request.get('name'),parent=parentKey)

		toon = toonKey.get()
		if not toon:
			toon = Toon(key=toonKey)
			toon.populate(
				name=self.request.get('name'),
				gender=self.request.get('gender'),
				race=self.request.get('race'),
				spec=self.request.get('spec')
				)

			# toon.createQuestsFromLevel()
			self.toon = toon
			self.toon.isDirty = True
			self.res['toonkey'] = toonKey.urlsafe()
		else:
			self.res['error'] = 'Character name already exists'

	def sellItem(self):

		id = self.request.get("id")
		logging.info(id)
		item = ndb.Key(urlsafe=id).get()
		if not item:
			self.error['cant find item']
			return
		salePrice = int(self.request.get("level")) * 10 #* INT_FOR_GRADE[item.grade]
		self.toon.gold += salePrice
		self.res['gold'] = self.toon.gold
		self.toon.removeInventoryItem(item)
		self.toon.isDirty = True

	def useItem(self):
		urlsafekey = self.request.get("id")
		if not self.toon.useItem(urlsafekey):
			self.res['error'] = self.toon.last_error
		self.res['toon'] = self.toon.toDict()
		
	def removeEquippedItem(self):
		keyid = self.request.get("id")
		self.toon.unequip(keyid)
		self.toon.isDirty = True
		self.res['toon'] = self.toon.toDict()


	def getMarket(self):
		from core.market import MARKET_ITEMS
		self.res['content'] = MARKET_ITEMS

	def gear_create(self):
		forge = Forge()
		# forge.makeArmor()
		# forge.makeWeapons()
		forge.makePotions()

	def updateStatus(self):
		toon = self.toon
		toon.user.status = self.request.get('status')
		toon.user.put()
		self.res['access_token'] = toon.user.access_token

	def ALERTS_get(self):
		# toon = self.toon
		alerts = []
		# for alert in toon.alerts:
		# 	a = alert.toDict()
		# 	alerts.append(a)
		self.res['alerts'] = alerts
	def ALERTS_remove(self):
		id = self.request.get('id')
		alert = Alert.get_by_id(long(id))
		if alert:
			db.delete(alert)

	

	
	# ENERGY FUNCTIONS
	def ENERGY_replenish(self):
		toon = self.toon
		toon.energy = toon.energyMax
		toon.isDirty = True
		self.res['content'] = toon.energy
		self.res['energy'] = toon.energy

	def addEssence(self):
		amount = int(self.request.get('amount'))
		self.toon.addEssence(amount)
		self.res['essence'] = self.toon.user.essence
		
	def updateStamina(self):
		self.toon.replenishEnergy()
		self.res['secondsTillNextEnergy']=self.toon.secondsTillNextEnergy
		self.res['energy'] = self.toon.energy
		self.res['replenishRate'] = self.toon.replenishRate

	def getGear(self):
		toon = self.toon
		self.res['gear']=toon.getGear()

	# BATTLE FUNCTIONS
	def getBattleList(self):
		_list = []
		q = Toon.query()
		for model in q.fetch(6):
			if model.name == self.toon.name:
				continue
			d = model.toDict()
			d['id'] =model.key.urlsafe() 
			_list.append(d)
			# _list.append({
			# 	'id':model.key.urlsafe(),
			# })

		self.res['content'] = _list

	def buyItem(self):
		toon = self.toon

		_type = self.request.get("type")#market category
		index = int(self.request.get("index"))#market index

		typeKey = {
			'mount':'mount',
			'gear':'character',
			'potion':'potions'
		}[_type]

		item = self.toon.market[typeKey][index]

		# logging.info(item)

		if item['currency'] == 'gold':
			if self.toon.gold >= item['price']:
				self.toon.gold -= item['price']
			else:
				self.res['error'] = ERROR_NOT_ENOUGH_GOLD
				return

		elif item['currency'] == 'essence':
			result = self.toon.useEssence(int(item['price']))
			if result != True:
				self.res['error'] = result
				return


		del self.toon.market[typeKey][index]
		for _i in range(len(self.toon.market[typeKey])):
			self.toon.market[typeKey][_i]['index'] = _i

		self.res['item'] = self.toon.addInventoryItem(item)
		self.toon.isDirty = True
		self.res['market'] = self.toon.market

	def getInventory(self):
		self.res['inventory'] = self.toon.getInventory()
		self.res['gear'] = self.toon.getGear()
		self.res['content']=self.res['inventory']

	def clearDatastore(self):
		
		ndb.delete_multi(User.query().fetch(keys_only=True))
		ndb.delete_multi(Toon.query().fetch(keys_only=True))
		ndb.delete_multi(PatchQuest.query().fetch(keys_only=True))
		ndb.delete_multi(PatchView.query().fetch(keys_only=True))
		ndb.delete_multi(PatchDungeon.query().fetch(keys_only=True))
		ndb.delete_multi(InventoryItem.query().fetch(keys_only=True))
		ndb.delete_multi(Alert.query().fetch(keys_only=True))
		ndb.delete_multi(Guild.query().fetch(keys_only=True))
		ndb.delete_multi(Buff.query().fetch(keys_only=True))

		# TODO comment before launch
		# ndb.delete_multi(Quest.query().fetch(keys_only=True))
		# ndb.delete_multi(ChainQuest.query().fetch(keys_only=True))


	def getImageList(self):
		path = os.path.join(os.path.dirname(__file__),'..','images_sym')
		self.res['content'] = os.listdir(path)

	def spendSkillPoint(self):
		attr = self.request.get("attribute")
		toon = self.toon
		if toon:
			if toon.skillpoints > 0:
				if attr == 'strength':
					toon.strength += 1
				elif attr == 'intelligence':
					toon.intelligence += 1
				elif attr == 'defense':
					toon.defense += 1
				elif attr == 'endurance':
					toon.endurance += 1
				toon.skillpoints -=1
				toon.isDirty =True

				self.res['content'] = db.to_dict(toon)
				self.res['skillpoints'] = toon.skillpoints
			else:
				self.res['success'] = False
				self.res['error'] = 'not enough skill points'

		else:
			self.res['success'] = False
			self.res['error'] = 'no toon with that name'

	def createNewsEntry(self):
		entry = NewsEntry()
		entry.title = self.request.get('title')
		entry.content = self.request.get('content')
		entry.created = datetime.now()
		entry.put()
		self.res['content'] = db.to_dict(entry)

	def getNews(self):
		q = NewsEntry.all().order('-created')
		self.res['content'] = []
		for entry in q.fetch(10):
			self.res['content'].append(db.to_dict(entry))

	def __getCharacters(self,user):
		# logging.info(user.toons.count())
		chars = []
		for t in user.toons:
			chars.append(db.to_dict(t))
		self.res['toons'] = chars

	def getResponse(self):
		return {
			'error':None,
			'success':True,
		}