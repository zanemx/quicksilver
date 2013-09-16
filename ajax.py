import webapp2
import json
from models import *
import logging
from google.appengine.ext import db
from p12utils import *
from datetime import datetime
import os
import random


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

		self.res = self.getResponse()

		if action:
			func = getattr(self,action)()
		else:
			self.res['success'] = False
			self.res['error'] = 'no action'
		self.response.out.write(p12Encoder.encode(self.res))

	def getDuelPartners(self):
		me = self.request.get("toonName")
		toons = []
		for toon in Toon.all().fetch(5):
			if toon.name == me: continue
			toons.append(toon.toDict())
		self.res['content'] = toons

	def doBattle(self):
		toonName = self.request.get('toonName')
		enemyName = self.request.get('enemy')

		winner = enemyName
		if random.randrange(0,10) > 5:
			winner = toonName

		self.res['winner'] = winner

	def buyInventoryItem(self):
		toon = Toon.get_by_key_name(key_names=self.request.get("toonName"))
		price = int(self.request.get("price"))
		if toon.gold >= price:
			toon.gold -= price

			# CREATE NEW INVENTORY ITEM
			InventoryItem(
				parent=toon.inventories.get(),
				name=self.request.get("name"),
				price=price,
				iconUrl=self.request.get("iconUrl")
				).put()
			toon.put()

	def getInventory(self):
		toon = Toon.get_by_key_name(key_names=self.request.get("toonName"))
		inventory = toon.inventories.get()
		items = []
		for item in db.query_descendants(inventory):
			items.append(item.toDict())
		self.res['content']=items

	def clearDatastore(self):
		# logging.info(self.request.get("xymox227"))
		# db.delete(db.Query(keys_only=True))
		db.delete(Guild.all(keys_only=True))
		db.delete(Inventory.all(keys_only=True))
		db.delete(InventoryItem.all(keys_only=True))
		db.delete(NewsEntry.all(keys_only=True))
		db.delete(Quest.all(keys_only=True))
		db.delete(Toon.all(keys_only=True))
		db.delete(User.all(keys_only=True))
		self.res['content'] = 'deleted all data models'


	def getImageList(self):
		path = os.path.join(os.path.dirname(__file__),'..','images_sym')
		self.res['content'] = os.listdir(path)

	def spendSkillPoint(self):
		characterName = self.request.get('characterName')
		attr = self.request.get("attribute")
		# user = self.getUser()
		toon = Toon.get_by_key_name(key_names=characterName)
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
				toon.put()

				self.res['content'] = db.to_dict(toon)
				self.res['skillpoints'] = toon.skillpoints
			else:
				self.res['success'] = False
				self.res['error'] = 'not enough skill points'

		else:
			self.res['success'] = False
			self.res['error'] = 'no toon with that name'


	def updateStatus(self):
		user = self.getUser()
		user.status = self.request.get('content')
		user.put()
	def getStatus(self):
		self.res['content'] = self.getUser().status

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


	def login(self):
		id = self.request.get('id')
		user = User.get_by_key_name(key_names=id)
		if not user:
			user = User(key_name=id,id=id)
			user.put()
		self.res['user'] = db.to_dict(user)
		self.__getCharacters(user)

	def __getCharacters(self,user):
		logging.info(user.toons.count())
		chars = []
		for t in user.toons:
			chars.append(db.to_dict(t))
		self.res['toons'] = chars


		# logging.info(self.getUser().characters)
		# self.res['characters']=db.to_dict(self.getUser().characters)

	def getUser(self):
		return User.get_by_key_name(key_names=self.request.get('uid'))

	# def getCharacters(self):
	# 	user = self.getUser()
	# 	chars = []
	# 	for t in user.toons:
	# 		chars.append(db.to_dict(t))
	# 	self.res['user'] = db.to_dict(user)
	# 	self.res['characters'] = chars

	def createCharacter(self):
		name = self.request.get('name').lower()
		gender = self.request.get('gender').lower()
		race = self.request.get('race').lower()

		if Toon.get_by_key_name(key_names=name):
			self.issueError('character name already exists. Please choose another name.')
			return

		user = self.getUser()
		toon = Toon(user=user,key_name=name,name=name,race=race,gender=gender)
		toon.put()

		self.res['toons'] = db.to_dict(toon)

	def buyCharacterSlot(self):
		user = self.getUser()
		if user.essence >= 100:
			user.essence -=100
			user.numslots += 1
			user.put()
		else:
			self.res['success']=False
			self.res['error'] = 'not enough essense'

	def getResponse(self):
		return {
			'error':None,
			'success':True,
		}

	def issueError(self,message):
		self.res['success'] = False
		self.res['error'] = message

