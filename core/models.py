#!/usr/bin/env python
from google.appengine.ext import ndb
from google.appengine.api import channel
from datetime import datetime,timedelta
from p12utils import *
import questdetails
from core.buffs import *
from qsutils import *
import math,logging,random
from core.market import *
from core.crafting import *
from core.constants import *

class MasterModel(ndb.Model):
	def getDescendant(self,descendant):
		items = []
		for _descendant in db.query_descendants(self):
			if _descendant.kind() == descendant:
				items.append(_descendant)
		return items

	def select(self,*args):
		result = {}
		for k in args:
			result[k] = getattr(self,k)
		result['id'] = self.key.urlsafe()
		return result


	def toDict(self):
		return self.to_dict()

class Feedback(MasterModel):
	user = ndb.KeyProperty(indexed=True)
	content = ndb.TextProperty(indexed=False)
	created = ndb.DateTimeProperty(indexed=True)

class AuctionHouse(MasterModel):

	items = ndb.JsonProperty(indexed=False)

	def hasItem(self,_type):
		return self.items[_type] > 0

	def addItem(self,_type):
		self.items[_type] += 1
		self.put()
		return True

	def removeItem(self,_type):
		if(self.items[_type]>0):
			self.items[_type] -= 1
			self.put()
			return True
		return False
	
	def getMarketValues(self):
		mvs = {
			'leather':10,
			'ore':10,
			'herbs':10
		}
		return mvs

	def getMarketValue(self,_type):
		mvs  = self.getMarketValues()
		return mvs[_type]



	def toDict(self):
		if not self.items:
			self.items = {
				'leather':0,
				'ore':0,
				'herbs':0
			}
			self.put()

		d = self.to_dict()
		d['marketValues'] = self.getMarketValues()
		return d

	

class Alert(MasterModel):
	title = ndb.StringProperty(indexed=False)
	content = ndb.TextProperty(indexed=False)
	link = ndb.StringProperty(indexed=False)
	created = ndb.DateTimeProperty(auto_now_add=True)
	imageUrl = ndb.StringProperty(indexed=False)
	actions = ndb.StringProperty(indexed=False,repeated=True)
	read = ndb.BooleanProperty(default=False,indexed=False)
	type=ndb.StringProperty(default="general",indexed=False)
	extra=ndb.StringProperty(indexed=False)

	def toDict(self):
		d = self.to_dict()
		d['key'] = self.key
		return d

class Buff(ndb.Expando):
	def initialize(self,details):
		d = details.toDict()
		for k,v in d.iteritems():
			setattr(self,k,v)
	def toDict(self):
		return self.to_dict()

class Quest(ndb.Expando):
	def toDict(self):
		d= self.to_dict()

		if hasattr(self,'reward'):
			reward = []
			if len(self.reward) > 0:
				for inventory_item_key in self.reward:
					item = ndb.Key("InventoryItem",inventory_item_key).get()
					if item:
						reward.append(item.toDict())
			d['reward'] = reward

		return d

class PatchQuest(ndb.Expando):
	def toDict(self):
		d= self.to_dict()

		if hasattr(self,'reward'):
			reward = []
			if len(self.reward) > 0:
				for inventory_item_key in self.reward:
					item = ndb.Key("InventoryItem",inventory_item_key).get()
					if item:
						reward.append(item.toDict())
			d['reward'] = reward

		return d

class ChainQuest(MasterModel):
	name = ndb.StringProperty(indexed=False)
	startDescription = ndb.TextProperty(indexed=False)
	endDescription = ndb.TextProperty(indexed=False)
	location = ndb.StringProperty(indexed=True)
	dungeon = ndb.StringProperty(indexed=True)
	quests = ndb.KeyProperty(repeated=True)
	level = ndb.IntegerProperty(indexed=True)
	chainIndex = ndb.IntegerProperty(default=0,indexed=False)
	complete = ndb.BooleanProperty(default=False,indexed=False)

	def addQuest(self,key):
		if key not in self.quests:
			self.quests.append(key)
			self.put()
			return True
		return False

	def removeQuest(self,key):
		if key in self.quests:
			self.quests.remove(key)
			self.put()
			return True
		return False

	def toDict(self):
		d = self.to_dict()
		quests = ndb.get_multi(self.quests)
		d['quests'] = [q.toDict() for q in quests]
		return d



class Toon(MasterModel):

	recipes = ndb.JsonProperty(indexed=False)
	resources = ndb.JsonProperty(indexed=False)
	profession = ndb.StringProperty(indexed =False)

	def updateRecipes(self):
		updateRecipeView(self)
		result = self.useEssence(self.recipes['cost'])
		
		if result:
			self.isDirty = True
		return result

	max_buffs = ndb.IntegerProperty(indexed=False,default=2)
	unlocked_dungeons = ndb.StringProperty(repeated=True)

	last_error = ndb.StringProperty(indexed=False)

	def doPushNotification(self,alert,_type):
		# todo check for channel expiration
		res = {}
		res['type'] = _type
		res['alert'] = alert.toDict()
		res['toon'] = self.toDict()
		
		channel.send_message(self.channelToken,p12Encoder.encode(res))

	def addGold(self,x):
		self.gold += x
		self.isDirty = True

	def addExp(self,x):
		self.exp += x
		self.isDirty=True

		level = self.level
		if level > self.lastLevel:
			self.onLevelUp()

	def addEnergy(self,x):
		newAmount = self.energy + x
		self.energy = min(newAmount,self.energyMax)
		self.isDirty = True

	def addEssence(self,x):
		user = self.user
		user.essence += x
		user.put()

	def onLevelUp(self):
		self.didLevelUp = True
		self.lastLevel = self.level
		self.skillpoints += 1
		
		a = Alert(
			parent=self.key,
			title="Level Up!",
			content="Congratulations you've reached level %i. Be sure to check the market for new equipment and weapons." % (self.level),
			actions=['dismiss']
			)
		a.put()
		self.doPushNotification(a,'level up')

		self.isDirty = True

	def useEssence(self,amt):
		current = self.user.essence
		diff = current-amt
		if diff >=0:
			user = self.user
			user.essence -= amt
			user.put()
			logging.info('using %i diff essence' % (diff))
			return True
		return ERROR_NOT_ENOUGH_ESSENCE

	mount = ndb.JsonProperty(indexed=False)

	market = ndb.JsonProperty(indexed=False)
	def updateMarketView(self,view):
		self.market[view] = updateMarketView(self,view)
		logging.info(self.market['cost'])
		result = self.useEssence(self.market['cost'])
		if result:
			self.isDirty = True
		return result


	party = ndb.KeyProperty(indexed=False,repeated=True)

	channelToken = ndb.StringProperty(indexed=False)

	@staticmethod
	def getByName(name):
		q = Toon.query().filter(Toon.name == name)
		if q.count() > 0:
			return q.get()
		return None
	
	isDirty = ndb.BooleanProperty(default=False,indexed=False)

	spec = ndb.StringProperty(default="druid",indexed=False)

	mapview = ndb.StringProperty(default="RedForest",indexed=False)
	lastmapview = ndb.StringProperty(default="TrainingGrounds",indexed=False)

	# quest_chain_id=ndb.IntegerProperty(default=0,indexed=False)
	# quest_chain_link_id=ndb.IntegerProperty(default=0,indexed=False)

	didLevelUp = ndb.BooleanProperty(default=False,indexed=False)
	lastLevel = ndb.IntegerProperty(default=1,indexed=False)
	@property
	def level(self):
		# level by experience
		mod = 400
		for i in range(1,100):
			expToNext = i*i*mod
			if expToNext >= self.exp:
				return i
		return 10#LEVEL CAP

	@property 
	def exp_to_next_level(self):
		mod = 400
		for i in range(1,100):
			expToNext = i*i*mod
			if expToNext > self.exp:
				return expToNext
		return 0#LEVEL CAP

	@property
	def user(self):
		return self.key.parent().get()

	inventory = ndb.KeyProperty(repeated=True)
	inventory_slot_count = ndb.IntegerProperty(default=8,indexed=False)

	def getInventory(self):
		return [item.toDict() for item in ndb.get_multi(self.inventory)]

	def getInventoryOverflow(self):
		overflow = []
		items = ndb.get_multi(self.inventory)
		if len(items) > self.inventory_slot_count:
			for i in range(self.inventory_slot_count,len(items)):
				overflow.append(items[i])

		return [x.toDict() for x in overflow]

	def getRandomOverflowItem(self):
		overflow = self.getInventoryOverflow()
		if(len(overflow)==0):return False
		return overflow[random.randrange(0,len(overflow))].toDict()
		

	def addInventoryItem(self,item):
		
		if item['type'] == 'mount':
			self.mount = item
			self.isDirty = True
			return item
		
		i = InventoryItem(parent=self.key)
		for k,v in item.iteritems():
			setattr(i,k,v)
		i.put()

		self.inventory.append(i.key)
		self.isDirty = True
		return i.toDict()

	def removeInventoryItem(self,item):
		# keyid = long(keyid)
		key = item.key
		logging.info(key in self.inventory)
		if key in self.inventory:
			self.inventory.remove(key)
			return True
		return False

	skillpoints = ndb.IntegerProperty(default=10,indexed=False)
	name = ndb.StringProperty(required=True,indexed=True)
	gold = ndb.FloatProperty(default= 10.0,indexed=False)
	race = ndb.StringProperty(required=True,indexed=False)
	exp= ndb.IntegerProperty(default=0,indexed=False)
	gender=ndb.StringProperty(required=True,indexed=False)
	rank=ndb.IntegerProperty(default=0,indexed=False)

	# ENERGY MECHENICS
	energy=ndb.IntegerProperty(default=30,indexed=False)
	energyMax=ndb.IntegerProperty(default=30,indexed=False)
	lastEnergyUpdate=ndb.DateTimeProperty(auto_now_add=True,indexed=False)
	replenishRate=ndb.IntegerProperty(default=120,indexed=False)
	secondsTillNextEnergy = ndb.FloatProperty(indexed=False)
	

	strength = ndb.FloatProperty(default=10.0,indexed=False)
	intelligence = ndb.FloatProperty(default=10.0,indexed=False)
	defense = ndb.FloatProperty(default=10.0,indexed=False)
	endurance = ndb.FloatProperty(default=10.0,indexed=False)
	# damage = ndb.FloatProperty(default=10.0,indexed=False)

	userid = ndb.StringProperty(indexed=False)

	# GEAR
	# head = ndb.IntegerProperty(indexed=False)
	# chest = ndb.IntegerProperty(indexed=False)
	# legs = ndb.IntegerProperty(indexed=False)
	# feet = ndb.IntegerProperty(indexed=False)
	# hands = ndb.IntegerProperty(indexed=False)
	# weapon = ndb.IntegerProperty(indexed=False)
	gear = ndb.JsonProperty(indexed=False,default={})
	gearscore = ndb.FloatProperty(indexed=False,default=0.0)

	@property
	def gearcap(self):
		return float((self.level + (self.level*3)) * 6)

	def useItem(self,urlsafekey):
		key = ndb.Key(urlsafe=urlsafekey)
		item = key.get()

		if not item:
			return

		# logging.info(item.type)
		if item.type == 'potion':
			if len(self.getBuffs())>=self.max_buffs:
				self.last_error = 'max buffs reached'
				return False
			else:
				self.addBuff(item)
				self.removeInventoryItem(item)
				

		if item.type=='buff':
			self.addBuff(item)
			self.removeInventoryItem(item)

		elif item.type == 'armor' or item.type == 'weapon':
			self.equip(item)
			self.removeInventoryItem(item)

		self.isDirty = True
		return True

	def equip(self,item):
		if not self.gear:self.gear = {}
		logging.info(item)
		if item.subType in self.gear:
			self.inventory.append(ndb.Key(urlsafe=self.gear[item.type if (item.type == 'weapon') else item.subType]['id']))

		self.gear[item.type if (item.type == 'weapon') else item.subType] = item.toDict()
		

	def addBuff(self,inventoryItem):
		b = Buff(parent=self.key)
		b.initialize(inventoryItem)
		b.put()

	def getBuffs(self):
		return [buff.toDict() for buff in Buff.query(ancestor=self.key)]

	def tickBuff(self):
		buffs = [buff for buff in Buff.query(ancestor=self.key)]
		for buff in buffs:
			if buff.uses>0:
				buff.uses-=1
				buff.put()
			else:
				self.removeBuff(buff)

	def removeBuff(self,buff):
		buff.key.delete()

	@property
	def warriorRating(self):
		if self.battlesWon == 0 or self.battles == 0:
			return 0
		return math.ceil(float(self.battlesWon / float(self.battles)) * 100)
	battles = ndb.IntegerProperty(default=0)
	battlesWon = ndb.IntegerProperty(default=0)
	alignment = ndb.FloatProperty()
	politicalRep= ndb.FloatProperty()

	revengeList = ndb.StringProperty(repeated=True,indexed=False)

	# def getNextQuest(self):
	# 	self.quest_chain_id, self.quest_chain_link_id = questdetails.getNext(self.quest_chain_id, self.quest_chain_link_id)
	# 	logging.info(self.quest_chain_id)
	# 	logging.info(self.quest_chain_link_id)

	def spendEnergy(self,amount):
		if self.energy >= amount:
			self.energy -= amount
			self.isDirty= True
			return True
		else:
			return False

	def replenishEnergy(self):
		rr = self.replenishRate
		# apply mount mod
		# logging.info(rr)
		if self.mount:
			rr -= (float(rr) * self.mount['stamina_mod'])
			rr = int(rr)

		now = datetime.now()
		delta = now - self.lastEnergyUpdate#returns a timedelta object
		if delta.seconds >= rr:
			# logging.info('add accumulated energy')
			accumulatedEnergy = delta.seconds / rr
			self.energy += int(accumulatedEnergy)
			self.energy = min(self.energy,self.energyMax)
			self.lastEnergyUpdate = now


		# next update
		# next = (lastEnergyUpdate + replenishRate) - now
		# next = replenishRate - (now - last)
		next = timedelta(seconds=rr) - (now-self.lastEnergyUpdate)

		# logging.info(next)

		
			
		
		# secondsTillNextEnergy = float(delta.seconds)
		# logging.info(secondsTillNextEnergy)
		# while secondsTillNextEnergy % rr != 0:
			# secondsTillNextEnergy += 1
		# secondsTillNextEnergy = secondsTillNextEnergy - float(delta.seconds)
		# logging.info(secondsTillNextEnergy)
		self.secondsTillNextEnergy = float(next.seconds)
		self.put()

	def getRevengeList(self):
		revenge = []
		for toonid in self.revengeList:
			toon = Toon.get_by_key_name(key_names=toonid)
			revenge.append(toon.toDict())
		return revenge

	def getAlerts(self):
		alerts = [alert for alert in Alert.query(ancestor=self.key)]
		return [a.toDict() for a in alerts]

	def getParty(self):
		party = []
		entities = ndb.get_multi(self.party)
		for member in entities:
			party.append(member.toDict())
		return party

	def addPartyMember(self,newMember,oldMember):

		# remove old member
		# logging.info(oldMember)
		# logging.info(self.party)

		if oldMember:
			if oldMember.key == newMember.key:
				logging.info('nothing to do')
				return
			if oldMember.key in self.party:
				self.party.remove(oldMember.key)

		if len(self.party) < 2:
			if newMember.key not in self.party:
				self.party.append(newMember.key)
			else:
				logging.info('already in party')
				return
		else:
			logging.info('too many party members')
			return

		self.isDirty=True

	def removePartyMember(self,member):
		if member.key in self.party:
			self.party.remove(member.key)


	

	@property
	def calculated(self):
		stats = {
			'strength':self.strength,
			'intelligence':self.intelligence,
			'defense':self.defense,
			'endurance':self.endurance,
			'hp':0,
			'damage':0,
			'replenishRate':self.replenishRate
		}

		# gearscore = sum([x for x in stats.itervalues()])
		gearscore = 0

		attribs = ['intelligence','strength','defense','endurance']
		types = ['head','chest','legs','feet','hands','weapon']

		# apply mount stats
		if self.mount:
			
			rr = self.replenishRate
			rr -= (float(rr) * self.mount['stamina_mod'])
			# rr = int(rr)
			stats['replenishRate'] = rr

			mount = self.mount
			for attrib in attribs:
				if attrib in mount:
					amount_to_add = mount[attrib]
					stats[attrib] += amount_to_add
					gearscore += amount_to_add
		
		# apply gear stats
		if self.gear:
			gear = self.gear
			for _type in types:
				if _type in gear:
					for attrib in attribs:
						if attrib in gear[_type]:
							amount_to_add = gear[_type][attrib]
							stats[attrib] += amount_to_add
							gearscore += amount_to_add

		# PARTY
		# add 10 % all stats increase for each party member
		party = self.getParty()
		for i in range(1,len(party)+1):
			for k,v in stats.iteritems():
				stats[k] += v * (i*0.1)

		# BUFFS
		buffs = self.getBuffs()
		for buff in buffs:
			for attrib in attribs:
				if attrib in buff:
					amount_to_add = buff[attrib]
					stats[attrib] += amount_to_add
					# gearscore += amount_to_add


		# HIT POINTS
		mod = sum([x for x in stats.itervalues()]) * 0.001
		hp = self.level * 100
		hp += hp * mod
		stats['hp'] = math.ceil(hp)

		# DAMAGE
		damage = self.level * 20
		damage += damage * mod
		stats['damage'] = math.ceil(damage)


		self.gearscore = gearscore
		return stats

	def toDict(self):

		user = self.user

		now = datetime.now()

		# CHECK ENERGY
		self.replenishEnergy()

		level = self.level
		if level > self.lastLevel:
			self.onLevelUp()

		self.market,needsUpdate = getMarket(self)
		if needsUpdate:
			self.isDirty = True

		# resources 
		if not self.resources:
			self.resources={
				'leather':0,
				'ore':0,
				'herbs':0
			}
			self.isDirty=True

		self.recipes,recipesNeedsUpdate = getRecipes(self)
		if recipesNeedsUpdate:
			self.isDirty = True


		d = self.to_dict()

		# d['party'] = self.getParty()
		d['buffs'] = self.getBuffs()
		d['user']=self.user.key
		d['keyid']=self.key
		d['inventory'] = self.getInventory()
		d['level'] = level
		d['exp_to_next_level'] = self.exp_to_next_level
		d['essence'] = user.essence
		d['iconUrl'] = 'static/app/images/characters/heroes/hero_%s_%s.png' % (self.race.lower(),self.gender.lower())
		d['className'] = '%s_%s' %(self.race.lower(),self.gender.lower())
		d['alerts'] = self.getAlerts()
		d['warriorRating'] = self.warriorRating
		d['status'] = user.status
		d['gold']=int(self.gold)
		d['calculated'] = self.calculated

		key = None
		attribs = ['intelligence','strength','defense','endurance','damage']
		armorTypes = ['head','chest','legs','feet','hands','weapon']
		
		# gear = d['gear']
		# gearscore = 0
		# for armorType in armorTypes:
		# 	if gear[armorType]:
		# 		for attrib in attribs:
		# 			if attrib in gear[armorType]:
		# 				amount_to_add = gear[armorType][attrib]
		# 				d['calculated_%s' %(attrib)] += amount_to_add
		# 				gearscore += amount_to_add

		d['gearscore'] = self.gearscore

		# calculate spec
		spec = specFromStats(d['calculated']['strength'],d['calculated']['intelligence'])
		if self.spec != spec:
			self.spec = spec
			self.isDirty = True
		d['spec'] = self.spec.capitalize()

		

		# channel logic
		self.channelToken = channel.create_channel(self.name, duration_minutes=1000)
		# logging.info(self.channelToken)
		d['channelToken'] = self.channelToken

		# get my guilds by keyid
		q = Guild.query().filter(Guild.members.IN([self.name]))
		d['guilds'] = [x.toDict() for x in q]



		return d



class User(MasterModel):
	essence=ndb.IntegerProperty(default=100)
	numslots = ndb.IntegerProperty(default=1)
	status = ndb.TextProperty(default='Playing Quicksilver!')
	access_token = ndb.StringProperty()

	def toDict(self):
		d = self.to_dict()
		toons = Toon.query(ancestor=self.key)
		d['characters'] = [toon.toDict() for toon in toons]
		d['key'] = self.key.urlsafe()
		return d


class InventoryItem(ndb.Expando):
	def toDict(self):
		d = self.to_dict()
		d['id'] = self.key.urlsafe()
		return d


class Guild(MasterModel):
	name = ndb.StringProperty()
	level = ndb.IntegerProperty(default=1,indexed=False)
	reputation = ndb.IntegerProperty(default=1,indexed=False)
	members = ndb.StringProperty(repeated=True)
	leader = ndb.KeyProperty(indexed=True)

	def addMember(self,name):
		if name in members:
			return False
		self.members.append(name)
		self.put()
		return True

	def removeMemeber(self,name):

		logging.info(name in self.members)
		if name in self.members:
			self.members.remove(name)
			self.put()

	@property
	def rank(self):
		return 1

	def getPerks(self):
		from guild import perks
		return perks

	def toDict(self):
		d = self.to_dict()
		leader = self.leader.get()
		d['leader'] = self.leader.get().select('name','level')
		d['count'] = len(self.members)
		d['rank'] = self.rank
		d['perks'] = self.getPerks()
		return d

MATCH_2_KEYS = ['hit','essence','gold','exp','energy']
class PatchView(ndb.Expando):
	visibleExits = ndb.JsonProperty(repeated=True,indexed=False)
	chains = ndb.JsonProperty(indexed=False,repeated=True)
	exits = ndb.JsonProperty(indexed=False,repeated=True)
	chainIndex = ndb.IntegerProperty(indexed =False,default=0)
	questIndex = ndb.IntegerProperty(indexed=False,default=0)

	def createFromView(self,view):
		# adopt view attributes
		for k,v in view.iteritems():
			setattr(self,k,v)

		self.sortChains()

		self.curateMatch2Quest()
		self.put()

	def sortChains(self):
		self.chains.sort(key=lambda chain: chain['chainIndex'])

	def getChainAndQuest(self):
		chain = None
		quest = None
		if self.chainIndex < len(self.chains):
			chain = self.chains[self.chainIndex]
		else:
			return None,None

		if self.questIndex < len(chain['quests']):
			quest = chain['quests'][self.questIndex]

		return chain,quest

	def getQuest(self):
		return self.chains[self.chainIndex]['quests'][self.questIndex]
		# self.put()
	def advanceMatch2Questing(self,i,j):
		i = int(i)
		j = int(j)
		c,q = self.getChainAndQuest()
		if q:
			if q['match2grid'][i]['rewardKey'] == q['match2grid'][j]['rewardKey']:
				q['match2grid'][i]['matched'] =True
				q['match2grid'][j]['matched'] =True
				self.put()
				return q['match2grid'][i]
			else:
				return False
		return False

	def curateMatch2Quest(self):

		c,q =self.getChainAndQuest()
		if q:
			keys = []
			while len(keys)<16:
				r = random.randrange(0,100)

				if r > 99:
					item = getRandomItemWithSpecificGrade('epic')
					keys.append({'matched':False,'rewardKey':item})
					keys.append({'matched':False,'rewardKey':item})
				elif r > 97:
					item = getRandomItemWithSpecificGrade('rare')
					keys.append({'matched':False,'rewardKey':item})
					keys.append({'matched':False,'rewardKey':item})
				elif r >95:
					keys.append({'matched':False,'rewardKey':'essence'})
					keys.append({'matched':False,'rewardKey':'essence'})
				elif r > 90:
					item = getRandomItemWithSpecificGrade('uncommon')
					keys.append({'matched':False,'rewardKey':item})
					keys.append({'matched':False,'rewardKey':item})
				elif r > 80:
					keys.append({'matched':False,'rewardKey':'energy'})
					keys.append({'matched':False,'rewardKey':'energy'})
				elif r > 70:
					keys.append({'matched':False,'rewardKey':'exp'})
					keys.append({'matched':False,'rewardKey':'exp'})
				elif r > 60:
					item = getRandomItemWithSpecificGrade('common')
					keys.append({'matched':False,'rewardKey':item})
					keys.append({'matched':False,'rewardKey':item})
				elif r > 50:
					keys.append({'matched':False,'rewardKey':'gold'})
					keys.append({'matched':False,'rewardKey':'gold'})
				
			random.shuffle(keys)
			for i in range(0,len(keys)):
				keys[i]['index'] = i
			q['match2grid'] = keys


	def finishQuest(self):
		self.questIndex += 1
		self.curateMatch2Quest()
		self.put()

	def finishChain(self):

		c,q = self.getChainAndQuest()
		dungeon = c['dungeon']

		self.chainIndex += 1
		self.questIndex = 0
		self.curateMatch2Quest()
		self.put()

		return dungeon
		
	def toDict(self):
		d = self.to_dict()
		d['currentChain'],d['currentQuest'] = self.getChainAndQuest()
		return d


class PatchDungeon(ndb.Expando):
	name = ndb.StringProperty(indexed=True)
	progression = ndb.JsonProperty(indexed=False)

	def create(self,dungeon_name,difficulty):
		from dungeons import Dungeon
		chain = ChainQuest.query().filter(ChainQuest.dungeon == dungeon_name).get()
		d = Dungeon(level=chain.level,difficulty=difficulty,name=dungeon_name)
		dDict = d.toDict()
		for k,v in dDict.iteritems():
			setattr(self,k,v)

		self.started = True
		self.put()

	def setDifficulty(self,difficulty):
		pass

	@property
	def progress(self):
		return int(float(self.progression_index) / float(len(self.progression)) * 100)

	def toDict(self):
		d=self.to_dict()
		d['progress']= self.progress
		return d

