#!/usr/bin/env python
from core.p12utils import Utils
from datetime import datetime,timedelta
from constants import *
from gear import *
import logging,random


DEFAULT_MARKET = {
	'updated':None,
	'character':[],
	'mount':[],
	'potions':[],
	'cost':1
}

def getMarket(self):

	market = self.market
	now = datetime.now()

	# create first market
	if not market or market == []:
		market = getNewMarket(self)
		market['updated'] = str(now)
		return market,True

	else:
		# check for expired store
		last = Utils.stringToDatetime(market['updated'])
		if now > last + timedelta(minutes=5):#timedelta(hours=24):
			market = getNewMarket(self)
			market['updated'] = str(now)
			market['cost'] = 1
			return market,True
		return market,False

def updateMarketView(self,view):
	m = {
		'character':generateCharacterMarket(self),
		'mount':generateMountMarket(self),
		'potions':generatePotionsMarket(self)
	}.get(view)
	self.market['cost'] += 1
	return m

def getNewMarket(self):
	market = DEFAULT_MARKET
	market['character'] = generateCharacterMarket(self)
	market['mount'] = generateMountMarket(self)
	market['potions'] = generatePotionsMarket(self)
	return market

def generateCharacterItem(self):
	item = grantRandomItem(self)
	item['market_type']='gear'
	item['currency'] = {
		'common':'gold',
		'uncommon':'essence',
		'rare':'essence',
		'epic':'essence'
	}.get(item['grade'])
	return item

def generateMountItem(self):
	item = {}
	item['type'] = 'mount'
	item['market_type']= 'mount'
	uses = None
	grade = None
	modifier = 0
	price = 0
	currency = 'gold'
	level = self.level
	stamina_mod = 1
	grade_modifier = 1
	cp = copy(BASE_STATS)
	stats = {}
	r = random.randrange(0,101)
	if r > 99:
		stamina_mod = random.randrange(14,21)
		grade=GRADE_EPIC
		price = INT_FOR_GRADE[grade] * level * 15 * stamina_mod
		modifier = 4
		uses = 40
		currency = 'essence'
		grade_modifier = 1.4
		while len(cp)>0:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
	elif r > 90:
		stamina_mod = random.randrange(8,14)
		grade = GRADE_RARE
		price = INT_FOR_GRADE[grade] * level * 10 * stamina_mod
		modifier = 3
		uses = 30
		currency = 'essence'
		grade_modifier = 1.3
		while len(cp)>1:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
	elif r > 80:
		stamina_mod = random.randrange(4,8)
		grade = GRADE_UNCOMMON
		price = INT_FOR_GRADE[grade] * level * 5 * stamina_mod
		modifier = 2
		uses = 20
		currency = 'essence'
		grade_modifier = 1.2
		while len(cp)>2:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
		stamina_mod = random.randrange(1,4)
	else:
		grade = GRADE_COMMON
		price = INT_FOR_GRADE[grade] * level * 100 * stamina_mod
		modifier = 1
		uses = 10
		grade_modifier = 1.1
		while len(cp)>3:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)

	for k,v in stats.iteritems():
		item[k] = v

	item['description'] = "+%i%% increase to stamina regen time" % (stamina_mod)
	item['grade'] = grade
	item['modifier'] = modifier
	item['uses'] = uses
	item['price'] = price
	item['className'] = "%smount" % (grade)
	item['title'] = '%s Mount' % (grade.capitalize())
	item['name'] = '%s Mount' % (grade.capitalize())
	item['stamina_mod'] = stamina_mod * 0.01 #convert to percentage
	
	item['color'] = GRADE_COLORS[grade]
	item['currency'] = currency
	item['level'] = level
	return item

def generatePotionItem(self):
	item = {}
	item['type'] = 'potion'
	item['market_type']= 'potion'
	uses = None
	className = 'potionstrength'
	grade = None
	modifier = 0
	price = 0
	currency = 'gold'
	level = self.level
	r = random.randrange(0,101)
	grade_modifier = 1
	cp = copy(BASE_STATS)
	stats = {}
	if r > 99:
		grade=GRADE_EPIC
		price = INT_FOR_GRADE[grade] * level * 15
		modifier = 4
		uses = 40
		currency = 'essence'
		className = 'potiondefense'
		grade_modifier = 1.4
		while len(cp)>0:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
	elif r > 94:
		grade = GRADE_RARE
		price = INT_FOR_GRADE[grade] * level * 10
		modifier = 3
		uses = 30
		currency = 'essence'
		className = 'potionendurance'
		grade_modifier = 1.3
		while len(cp)>1:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
	elif r > 79:
		grade = GRADE_UNCOMMON
		price = INT_FOR_GRADE[grade] * level * 5
		modifier = 2
		uses = 20
		currency = 'essence'
		className = 'potionintelligence'
		grade_modifier = 1.2
		while len(cp)>2:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
	else:
		grade = GRADE_COMMON
		price = INT_FOR_GRADE[grade] * level * 100
		modifier = 1
		uses = 10
		grade_modifier = 1.1
		while len(cp)>3:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)

	
	
	for k,v in stats.iteritems():
		item[k] = v

	item['grade'] = grade
	item['modifier'] = modifier
	item['uses'] = uses
	item['price'] = price
	item['className'] = className
	item['title'] = '%s Potion' % (grade.capitalize())
	item['name'] = item['title']
	# item['description'] = '+%i all stats' % (modifier)
	item['color'] = GRADE_COLORS[grade]
	item['currency'] = currency
	item['stackable'] = True
	item['level'] = level
	return item


def generateMountMarket(self):
	items=[]
	for i in range(0,6):
		item = generateMountItem(self)
		item['index'] = i
		items.append(item)
	return items

def generatePotionsMarket(self):
	items=[]
	for i in range(0,6):
		item = generatePotionItem(self)
		item['index'] = i
		items.append(item)
	return items

def generateCharacterMarket(self):
	items=[]
	for i in range(0,6):
		item = generateCharacterItem(self)
		item['index'] = i
		items.append(item)
	return items
