from google.appengine.ext import db
from datetime import datetime
from p12utils import *
import logging

class MasterModel(db.Model):
	pass
	# def toDict(self):
	# 	return p12Encoder.encode(db.to_dict(self))

	# def save(self,params):
	# 	for k,v in params.iteritems():
	# 		if k == 'id':continue;
	# 		setattr(self,k,v)
	# 	self.put()

class User(MasterModel):
	essence=db.IntegerProperty(default=1000)
	numslots = db.IntegerProperty(default=1)
	status = db.TextProperty(default='Playing Quicksilver!')

	def toDict(self):

		d = db.to_dict(self)
		characters = []
		for character in self.toons:
			characters.append(db.to_dict(character))
		d['characters'] = characters
		return d
	

class Toon(MasterModel):
	skillpoints = db.IntegerProperty(default=10)
	name = db.StringProperty(required=True)
	level = db.IntegerProperty(default=1)
	gold = db.IntegerProperty(default=1000)
	race = db.StringProperty(required=True)
	exp= db.IntegerProperty(default=0)
	gender=db.StringProperty(required=True)
	energy=db.IntegerProperty(default=10)
	energyMax=db.IntegerProperty(default=10)
	lastEnergyUpdate=db.DateTimeProperty()
	rank=db.IntegerProperty(default=0)

	strength = db.FloatProperty(default=1.0)
	intelligence = db.FloatProperty(default=1.0)
	defense = db.FloatProperty(default=1.0)
	endurance = db.FloatProperty(default=1.0)

	userid = db.StringProperty()
	guild = db.ReferenceProperty()
	user = db.ReferenceProperty(User,collection_name='toons')

	def toDict(self):
		d = db.to_dict(self)
		quests = []
		for quest in self.quests:
			quests.append(quest.toDict())
		d['quests'] = quests
		d['essence'] = self.user.essence

		# calculate amount of energy gained from last time this toon was queried
		

		return d


BUFF_STATE_ON = 1
BUFF_STATE_PAUSED = 2
BUFF_STATE_EXPIRED = 3
class ToonBuff(MasterModel):
	character = db.ReferenceProperty(Toon,collection_name="buffs")
	duration = db.DateTimeProperty()
	started = db.DateTimeProperty()
	name = db.StringProperty()
	description = db.TextProperty()
	state = db.IntegerProperty(default=BUFF_STATE_ON)

class Equipment(MasterModel):
	charcter = db.ReferenceProperty(Toon,collection_name='equipment_sets')



class Inventory(MasterModel):
	character = db.ReferenceProperty(Toon,collection_name="inventories")
	numSlots = db.IntegerProperty(default=8)

	def toDict(self):
		d = db.to_dict(self)
		items = []
		for item in db.query_descendants(self):
			items.append(item.toDict())
		d['items'] = items
		return d

class InventoryItem(MasterModel):
	name = db.StringProperty()
	price = db.IntegerProperty()
	description= db.TextProperty()
	iconUrl = db.StringProperty()

	def toDict(self):
		d = db.to_dict(self)
		d['id'] = self.key().id()
		return d

class Quest(MasterModel):
	name = db.StringProperty()
	description = db.StringProperty()
	stepCurrent=db.IntegerProperty(default=0)
	stepTotal=db.IntegerProperty()
	complete = db.BooleanProperty(default=False)
	boss = db.BooleanProperty(default=False)
	loot = db.StringListProperty()
	gold = db.IntegerProperty()
	essence = db.IntegerProperty()
	energy = db.IntegerProperty()
	exp = db.IntegerProperty()
	character = db.ReferenceProperty(Toon,collection_name='quests')

	def createFromObject(self,details):
		self.name = details.name
		self.description = details.description
		self.stepTotal = details.steps
		self.gold = details.gold
		self.essence = details.essence
		self.energy = details.energy
		self.exp = details.exp

	def toDict(self):
		d= db.to_dict(self)
		d['id'] = self.key().id()
		return d

class NewsEntry(MasterModel):
	title = db.StringProperty()
	content = db.TextProperty()
	created =  db.DateTimeProperty(auto_now_add=True)
	imageUrl = db.StringProperty()

	def toDict(self):
		return db.to_dict(self)

class Guild(MasterModel):
	name = db.StringProperty()
	level = db.IntegerProperty(default=1)
	reputation = db.IntegerProperty(default=1)
	members = db.StringListProperty()

	def toDict(self):
		d = db.to_dict(self)
		return d



