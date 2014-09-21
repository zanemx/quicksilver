#!/usr/bin/env python
from core.p12utils import Utils
from datetime import datetime,timedelta
from constants import *
from gear import *
import logging,random


DEFAULT_RECIPES = {
	'last_level':0,
	'recipes':[],
	'cost':1
}

def getRecipes(self):

	recipe = self.recipes
	# now = datetime.now()

	# create first recipe
	if not recipe or recipe == []:
		recipe = getNewRecipes(self)
		recipe['last_level'] = self.level
		return recipe,True

	else:
		# check for expired store
		last_level = recipe['last_level']
		# if now > last + timedelta(minutes=5):#timedelta(hours=24):
		if last_level != self.level:
			recipe = getNewRecipes(self)
			recipe['last_level'] = self.level
			recipe['cost'] = 1
			return recipe,True
		return recipe,False

def updateRecipeView(self):
	self.recipes['cost'] += 1
	self.recipes['recipes'] = generateCharacterRecipe(self)

def getNewRecipes(self):
	recipe = DEFAULT_RECIPES
	recipe['recipes'] = generateCharacterRecipe(self)
	return recipe

def _generateCharacterItem(self):
	item = grantRandomItem(self)
	item['market_type']='gear'
	item['currency'] = {
		'common':'gold',
		'uncommon':'essence',
		'rare':'essence',
		'epic':'essence'
	}.get(item['grade'])

	modifier = 4
	#calculate the resources needed to craft item
	if 'strength' in item:item['ore'] = item['strength'] * modifier
	if 'intelligence' in item:item['herbs'] = item['intelligence'] * modifier
	if 'endurance' in item:item['leather'] = item['endurance'] * modifier
	if 'defense' in item:
		r = random.randrange(0,3)
		if r == 0:
			if 'ore' in item:item['ore'] += item['defense'] * modifier
			else:item['ore'] = item['defense'] * modifier
		elif r == 1:
			if 'herbs' in item:item['herbs'] += item['defense'] * modifier
			else:item['herbs'] = item['defense'] * modifier
		elif r == 2:
			if 'leather' in item:item['leather'] += item['defense'] * modifier
			else:item['leather'] = item['defense'] * modifier

	return item

def generateCharacterRecipe(self):
	items=[]
	i=0
	while i<3:
		item = _generateCharacterItem(self)
		# logging.info(i)

		if item['grade'] == 'common':continue

		item['index'] = i
		items.append(item)
		i+=1
	return items
