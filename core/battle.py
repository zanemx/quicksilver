#!/usr/bin/env python
import constants,random,logging
from copy import copy
from math import ceil,floor

class Fighter(object):
	def __init__(self,stats):
		for k,v in stats.iteritems():
			setattr(self,k,v)

		self.hp = self.calculated['hp']
		self.max_hp = self.hp
		self.damage = self.calculated['damage']

	def toDict(self):
		return {
			'name':self.name,
			'hp':self.hp,
			'max_hp':self.max_hp,
			'damage':self.damage,
			'intelligence':self.calculated['intelligence'],
			'strength':self.calculated['strength'],
			'endurance':self.calculated['endurance'],
			'defense':self.calculated['defense']
		}

class Battle(object):

	def __init__(self,p1,p2):
		a = Fighter(p1)
		b = Fighter(p2)

		self.p1 = p1
		self.p2 = p2

		battle = []
		attacking = random.randrange(0,10) < 5

		while a.hp > 0 and b.hp > 0:

			crit = False
			hit = False
			miss = False
			dodge = False
			block = False

			crit_chance = (float(a.level) / float(b.level) / 0.4)*10
			
			rCrit = random.randrange(0,101)
			# logging.info('%f %f' % (rCrit,crit_chance))
			if(rCrit<crit_chance):
				crit = True
			
			offence = a
			defense = b
			if attacking:
				offence = b
				defense = a

			attacking = not attacking

			damage = offence.damage
			if crit:damage *= 2

			# apply accuracy
			accuracy = 30
			damage += (damage * random.randrange(accuracy) - accuracy*0.5) * 0.01
			
			damage = max(damage,1)

			defense.hp -= damage
			defense.hp = floor(defense.hp)

			battle.append({
				'me':copy(a).toDict(),
				'mob':copy(b).toDict(),
				'damage':floor(damage),
				'attacker':offence.name,
				'crit':crit,
				'hit':hit,
				'miss':miss,
				'dodge':dodge,
				'block':block
			})

		self.turns = battle
		self.winner = a.name if a.hp>0 else b.name

	def toDict(self):
		d = self.__dict__
		return d


