#!/usr/bin/env python
import logging 
import re

def getTalentTrees(level):
	_trees = []
	for i in TREES:
		tree = TREES[i]
		if tree['level'] <= level:
			_trees.append(tree)
	return _trees

class Skill(object):
	def __init__(self):
		self.chance_to_hit = 0.05 #5% 
		self.current_points = 0
		self.className = 'epicclothhead'
		self.name = self.__class__.__name__
		self.prettyName = re.sub(r"(\w)([A-Z])", r"\1 \2", self.__class__.__name__)
		self.onInit()
	def toDict(self):
		return self.__dict__

class ImprovedIntelligence(Skill):
	def onInit(self):
		self.max_points = 5
		self.required_level = 0
		self.stat = 'intelligence'
		self.passive = True
		self.descriptions = [
			'Next Level: +5% intelligence',
			'Next Level: +10% intelligence',
			'Next Level: +15% intelligence',
			'Next Level: +20% intelligence',
			'Max Level'
		]
class ImprovedEndurance(Skill):
	def onInit(self):
		self.max_points = 5
		self.required_level = 0
		self.stat = 'endurance'
		self.passive = True
		self.descriptions = [
			'Next Level: +5% endurance',
			'Next Level: +10% endurance',
			'Next Level: +15% endurance',
			'Next Level: +20% endurance',
			'Max Level'
		]
class ImprovedStrength(Skill):	
	def onInit(self):
		self.max_points = 5
		self.required_level = 0
		self.stat = 'strength'
		self.passive = True
		self.descriptions = [
			'Next Level: +5% strength',
			'Next Level: +10% strength',
			'Next Level: +15% strength',
			'Next Level: +20% strength',
			'Max Level'
		]
class ImprovedDefense(Skill):
	def onInit(self):
		self.max_points = 5
		self.required_level = 0
		self.stat = 'defense'
		self.passive = True
		self.descriptions = [
			'Next Level: +5% defense',
			'Next Level: +10% defense',
			'Next Level: +15% defense',
			'Next Level: +20% defense',
			'Max Level'
		]

TREES = {
	'generic':{
		'level':1,
		'prettyName':'General Skills',
		'tree':[ImprovedIntelligence().toDict(),ImprovedDefense().toDict(),ImprovedStrength().toDict(),ImprovedEndurance().toDict()]
	}
}
