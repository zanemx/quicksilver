#!/usr/bin/env python
from mobs import *
import re,logging,sys

DUNGEON_EASY = 'easy'
DUNGEON_NORMAL = 'normal'
DUNGEON_HARD = 'hard'
DUNGEON_HEROIC = 'heroic'

# [(n,c.level if hasattr(c,'level') else None) for n,c in dungeons.__dict__.items() if isinstance(c,type)]
# dungeons.FinkeepUnderground.__bases__[0].__name__

def getDungeonList():
	return [
		"Finkeep Underground",
		"Traning Underground",
		"Trouble In Little Finkeep",
	]

DIFFICULTY_MODS = {
	'easy':0,
	'normal':1,
	'hard':3,
	'heroic':5
}

class Dungeon(object):
	def __init__(self,level,difficulty,name):

		self.level = level + DIFFICULTY_MODS[difficulty]

		self.prettyDifficulty = difficulty.capitalize()
		self.difficulty = difficulty
		self.name = name#self.__class__.__name__
		self.prettyName = name#re.sub(r"(\w)([A-Z])", r"\1 \2", self.__class__.__name__)
		self.progression = []
		self.progression_index = 0
		self.complete = False
		self.started = False
		self.create()

	def toDict(self):
		d = self.__dict__
		return d

	def step(self):
		pass

	def addMob(self,level,grade,name=None):
		mob = getRandomMob(level=level,grade=grade,name=name)
		self.progression.append(mob)

	def create(self):
		self.addMob(self.level,MOB_GRADE_COMMON)
		self.addMob(self.level,MOB_GRADE_COMMON)
		self.addMob(self.level,MOB_GRADE_COMMON)
		self.addMob(self.level,MOB_GRADE_UNCOMMON,'Baltar')
		self.addMob(self.level,MOB_GRADE_COMMON)
		self.addMob(self.level,MOB_GRADE_COMMON)
		self.addMob(self.level,MOB_GRADE_UNCOMMON,'Marionix')
		self.addMob(self.level+1,MOB_GRADE_RARE,'Sajaram')
		self.addMob(self.level+2,MOB_GRADE_EPIC,'Mandarb')
