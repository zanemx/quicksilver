#!/usr/bin/env python
import webapp2
import json
import os
import logging
from models import *
from google.appengine.ext import db
from p12utils import *
from quest import QUESTS

	# def get(self,id):
	# 	pass
	# def post(self,id):
	# 	pass
	# def put(self,id):
	# 	pass
	# def delete(self,id):
	# 	pass

class MasterHandler(webapp2.RequestHandler):
	
	def write(self,data):
		self.response.out.write(p12Encoder.encode(data))

class UserHandler(MasterHandler):
	def get(self,id):
		user = User.get_by_key_name(key_names=id)
		self.response.out.write(p12Encoder.encode(user.toDict()))
	def put(self,id):
		params = json.loads(self.request.body)
		user = User.get_or_insert(key_name=id)
		user.put()
		self.response.out.write(p12Encoder.encode(user.toDict()))

class CharacterHandler(MasterHandler):

	def get(self,id=None):
		if id:
			logging.info(id)

			toon = Toon.get_by_key_name(key_names=id)

			# logging.info(toon)
			self.response.out.write(p12Encoder.encode(toon.toDict()))
		else:
			userid = self.request.get('userid')
			user = User.get_by_key_name(userid)
			toons = []
			for toon in user.toons:
				toons.append(toon.toDict())
			self.write(toons)
		
	def post(self):
		params = json.loads(self.request.body)
		user = User.get_by_key_name(key_names=params.get("userid"))
		if Toon.all().filter("name =", params.get("name")).count() > 0:
			self.response.out.write('Character name already exists.')
		else:
			toon = Toon(
				key_name=params['name'],
				user=user,
				name=params['name'],
				gender=params['gender'],
				race=params['race'],
				userid=params['userid']
				)
			

			# CREATE INVENTORY
			inventory = Inventory(character=toon)
			inventory.put()

			# ADD SOME DEFAULT ITEMS TO INEVENTORY
			# InventoryItem(parent=inventory,name="Healing Potion").put()
			# InventoryItem(parent=inventory,name="Speed Potion").put()
			# InventoryItem(parent=inventory,name="Mana Potion").put()

			# ADD TOON TO DEFAULT GUILD
			guild = Guild.get_or_insert(key_name="Quicksilver Consortium",name="Quicksilver Consortium")
			guild.members.append(params['name'])
			guild.put()
			toon.guild = guild

			# GET DEFAULT QUESTS FOR LEVEL 1 TOON
			for quest in QUESTS[1]:
				# key = (toon.name + quest.name).replace(' ','').lower()
				q = Quest()
				q.character = toon
				q.createFromObject(quest)
				q.put()

			toon.put()

			# ADD TEST NEWS ARTICLE
			content = "Please welcome " + toon.name + " to Quicksilver."
			url = "static/app/images/characters/heroes/hero_" + toon.race.lower() + "_" + toon.gender.lower() + ".png";
			NewsEntry(title="New Player!",content=content,imageUrl=url).put()

			self.response.out.write(p12Encoder.encode(toon.toDict()))

	def put(self,toonName):
		params = json.loads(self.request.body)
		toon = Toon.get_by_key_name(key_names=toonName)

		action = params.get("action")
		if action == 'addSkillPoint':
			if toon.skillpoints > 0:
				attribute = params.get("attribute")
				current = getattr(toon,attribute)
				setattr(toon,attribute,current+1)
				toon.skillpoints -= 1
				toon.put()
		self.write(toon.toDict())


		# for k,v in params.iteritems():
		# 	if k == 'strength' or k=='intelligence' or k == 'defense' or k=='endurance':
		# 		if toon.skillpoints > -1:
		# 			# toon.skillpoints -=1
		# 			_type = type(getattr(toon,k))
		# 			setattr(toon,k,_type(v))
		

# INVENTORY
class InventoryHandler(MasterHandler):
	def get(self,name):
		toon = Toon.get_by_key_name(key_names=name)
		inventories = []
		for inventory in toon.inventories:
			inventories.append(inventory.toDict())
		self.response.out.write(p12Encoder.encode(inventories))

	def post(self,id):
		pass
	def put(self,id):
		pass
	def delete(self,id):
		pass

# GUILD 
class GuildHandler(MasterHandler):
	def get(self,name):
		toon = Toon.get_by_key_name(key_names=name)
		guild = toon.guild
		if guild:
			self.response.out.write(p12Encoder.encode(guild.toDict()))

# QUEST
class QuestHandler(MasterHandler):
	def get(self,id=None):
		if id:
			logging.info("get one quest")
		else:
			toonName = self.request.params.get("toonName")
			toon = Toon.get_by_key_name(key_names=toonName)
			quests = []
			for q in toon.quests:
				d = q.toDict()
				quests.append(d)
			self.write(quests)

	def put(self,id):
		quest = Quest.get_by_id(long(id))
		# if quest.stepCurrent < quest.stepTotal:
		if not quest.complete:
			toon = quest.character
			if toon.energy > 0:
				toon.energy -= 1
				quest.stepCurrent += 1
				if quest.stepCurrent == quest.stepTotal:
					quest.complete = True
					toon.gold += quest.gold
					toon.energy += quest.energy
					toon.exp += quest.exp
					toon.user.essence += quest.essence
					toon.user.put()
				toon.put()
				quest.put()

		self.write(quest.toDict())


# NEWS
class NewsHandler(MasterHandler):
	def get(self):
		articles = []
		for entry in NewsEntry.all():
			articles.append(entry.toDict())
		self.write(articles)











