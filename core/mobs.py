#!/usr/bin/env python
import random,logging,math

MOB_GRADE_COMMON = 0
MOB_GRADE_UNCOMMON = 1
MOB_GRADE_RARE = 2
MOB_GRADE_EPIC = 3

GRADE_FOR_INT=[
	'common',
	'uncommon',
	'rare',
	'epic'	
]

GRADE_COLORS = ["white","rgb(113, 252, 113)","blue","purple"]

class Mob(object):
	def __init__(self,name,level,grade,className):
		# logging.info(grade)
		self.name = name
		self.level = level
		self.grade = GRADE_FOR_INT[grade]
		self.className = className
		self.color = GRADE_COLORS[grade]
		self.intelligence = (level + (level*grade)) * 	6
		self.strength = (level + (level*grade)) * 		6
		self.defense = (level + (level*grade)) * 		6
		self.endurance = (level + (level*grade)) * 		6
		self.calculated = self.calc_stats()
	
	def calc_stats(self):
		stats = {
			'strength':self.strength,
			'intelligence':self.intelligence,
			'defense':self.defense,
			'endurance':self.endurance,
			'hp':0,
			'damage':0,
		}

		# HIT POINTS
		mod = sum([x for x in stats.itervalues()]) * 0.001
		hp = self.level * 100
		hp += hp * mod
		stats['hp'] = math.ceil(hp)
		self.hp = stats['hp']

		# DAMAGE
		damage = self.level * 20
		damage += damage * mod
		stats['damage'] = math.ceil(damage)
		self.damage = stats['damage']
		
		return stats

	def toDict(self):
		return self.__dict__

MOB_NAMES = [
	'V Slasher',
	'Carrom',
	'Stormdog',
	'Sion Killer',
	'Psychic Bane',
	'Roz Muck',
	'Carion Creeper',
	'Slime Worm',
	'Zickorof',
	'Archer Bane'
]
MOB_ICONS=[
	'pincerbug',
	'trog',
	'stormhorse',
	'bird6',
	'bloodbeetle',
	'bloodworm',
	'stormhorse',
	'cowweed9c',
	'plaguerat',
	'dreamlizard'
]

def getRandomMob(level,grade=None,name=None,className=None):

	if className is None:
		index = random.randrange(0,len(MOB_NAMES)-1)
		className = MOB_ICONS[index]

	if name is None:
		index = random.randrange(0,len(MOB_NAMES)-1)
		className = MOB_ICONS[index]
		name = MOB_NAMES[index]
	
	if grade is None:
		grade = MOB_GRADE_COMMON
		r = random.randrange(0,100)
		if r > 99:
			grade = MOB_GRADE_EPIC
		elif r > 94: 
			grade = MOB_GRADE_RARE
		elif r > 80:
			grade = MOB_GRADE_UNCOMMON

	return Mob(name,level,grade,className).toDict()
