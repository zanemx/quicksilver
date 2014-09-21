
import logging
from models import InventoryItem
from market import *
from google.appengine.ext import ndb
from core.constants import *

class Forge(object):
	def __init__(self):
		pass

	def makeArmor(self):
		updates = []
		grades = [0,1,2,3]

		#LEVELS
		for level in range(1,11):

			#ARMOR GRADES
			iGrade = 0
			for grade in [GRADE_COMMON,GRADE_UNCOMMON,GRADE_RARE,GRADE_EPIC]:

				# ARMOR TYPES
				for subType in [GEAR_HEAD,GEAR_CHEST,GEAR_LEGS,GEAR_FEET,GEAR_HANDS]:

					levelGradeType = ('%i%s%s' % (level,grade,subType))
					key = ndb.Key("InventoryItem",levelGradeType)
					
					item = InventoryItem(key=key)
					item.stackable = False
					item.keyid = levelGradeType
					# logging.info(item)
					
					item.prettyName = "%s %s %s" % (grade.capitalize(),subType,TAG_NAMES[level-1])
					item.name = item.prettyName
					item.color = GRADE_COLORS[grade]
					item.price = level + (level*iGrade)

					item.grade = grade
					item.level = level
					item.type = 'armor'
					item.subType = subType
					item.gearType = GEAR_TYPE_CHAINMAIL

					item.className = ('%s%s%s' % (grade,item.gearType,subType))
					
					item.intelligence = level + (level*iGrade)
					item.strength = level + (level*iGrade)
					item.defense = level + (level*iGrade)
					item.endurance = level + (level*iGrade)

					updates.append(item)
				iGrade+=1
		ndb.put_multi(updates)
		print "armor created"


	def makeWeapons(self):
		updates = []
		grades = [0,1,2,3]

		#LEVELS
		for level in range(1,11):

			#ARMOR GRADES
			iGrade = 0
			for grade in [GRADE_COMMON,GRADE_UNCOMMON,GRADE_RARE,GRADE_EPIC]:

				# ARMOR TYPES
				for subType in [GEAR_SWORD,GEAR_MACE,GEAR_STAVE]:

					levelGradeType = ('%i%s%s' % (level,grade,subType))
					key = ndb.Key("InventoryItem",levelGradeType)

					item = InventoryItem(key=key)
					item.stackable = False
					item.keyid = levelGradeType

					item.prettyName = "%s %s %s" % (grade.capitalize(),subType,TAG_NAMES[level-1])
					item.name = item.prettyName
					item.color = GRADE_COLORS[grade]
					item.price = level + (level*iGrade)

					item.grade = grade
					item.level = level
					item.type = 'weapon'
					item.subType = subType
					item.gearType = GEAR_TYPE_NONE

					item.className = ('%s%s%s' % (grade,item.gearType,subType))
					
					item.damage = level + (level*iGrade)

					item.intelligence = level + (level*iGrade)
					item.strength = level + (level*iGrade)
					item.defense = level + (level*iGrade)
					item.endurance = level + (level*iGrade)

					# if iGrade>0:
					# 	item.intelligence = level + (level*iGrade)
					# 	if iGrade > 1:
					# 		item.strength = level + (level*iGrade)
					# 		if iGrade >2:
					# 			item.defense = level + (level*iGrade)
					# 			item.endurance = level + (level*iGrade)

					updates.append(item)
				iGrade+=1
		ndb.put_multi(updates)
		print "weapons created"


	def makePotions(self):
		updates = []

		for _item in MARKET_ITEMS:
			key = ndb.Key('InventoryItem',_item['name'].lower())
			item = InventoryItem(key=key)
			item.stackable = True
			item.keyid = _item['name']
			for k,v in _item.iteritems():
				setattr(item,k,v)
			updates.append(item)
		ndb.put_multi(updates)
		print "potions created"







