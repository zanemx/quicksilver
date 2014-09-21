#!/usr/bin/env python
import random

SKINNING = 'skinning'
MINING = 'mining'
HERBALISM = 'herbalism'

ERROR_OUT_OF_ENERGY = 'out of energy'
ERROR_NOT_ENOUGH_GOLD = 'not enough gold'
ERROR_OUT_OF_ESSENCE = 'out of essence'
ERROR_NOT_ENOUGH_ESSENCE = 'not enough essence'

ITEM_TYPE_CONSUMABLE = 'consumable'
ITEM_TYPE_EQUIPABLE = 'equipable'

CURRENCY_ESSENCE = 'essence'
CURRENCY_GOLD = 'gold'

QUEST_PHYSICAL = 'physical'
QUEST_MENTAL = 'mental'

GRADE_COMMON = 'common'
GRADE_UNCOMMON = 'uncommon'
GRADE_RARE = 'rare'
GRADE_EPIC = 'epic'

GEAR_HEAD = 'head'
GEAR_CHEST = 'chest'
GEAR_LEGS = 'legs'
GEAR_FEET = 'feet'
GEAR_HANDS = 'hands'

GEAR_WEAPON = 'weapon'
GEAR_ARMOR = 'armor'

WEAPON_SWORD = 'sword'
WEAPON_MACE = 'mace'
WEAPON_STAFF = 'staff'
WEAPON_TOME = 'tome'

GEAR_TYPE_CHAINMAIL = 'chainmail'
GEAR_TYPE_CLOTH = 'cloth'
GEAR_TYPE_NONE = ''

COMMON_TAG_NAMES = [
	"of the Squirrel",
	"of the Mouse",
]
UNCOMMON_TAG_NAMES = [
	"of the Rat",
	"of the Lynx",
]
RARE_TAG_NAMES= [
	"of the Rino",
	"of the Moose",
	"of the Bear",
	"of the Bull",
]
EPIC_TAG_NAMES = [
	"of the Titan",
	"of the Gods"
]

GRADE_COLORS = {
	"common":"#BEBEBE",
	"uncommon":"rgb(113, 252, 113)",
	"rare":"#7373E1",
	"epic":"#E916E9"
}

INT_FOR_GRADE = {
	'common':1,
	'uncommon':2,
	'rare':3,
	'epic':4
}
GRADE_FOR_INT=[
	'common',
	'uncommon',
	'rare',
	'epic'	
]

ARMOR_SUB_TYPES = [GEAR_HEAD,GEAR_CHEST,GEAR_LEGS,GEAR_FEET,GEAR_HANDS]

WEAPON_SUB_TYPES = [WEAPON_SWORD,WEAPON_MACE,WEAPON_STAFF,WEAPON_TOME]

BASE_STATS = ['intelligence','strength','defense','endurance']

GRADES = [GRADE_COMMON,GRADE_UNCOMMON,GRADE_RARE,GRADE_EPIC]

TAG_NAMES = {
	'common':COMMON_TAG_NAMES,
	'uncommon':UNCOMMON_TAG_NAMES,
	'rare':RARE_TAG_NAMES,
	'epic':EPIC_TAG_NAMES
}

def getRandomGrade():
	return GRADES[random.randrange(0,len(GRADES))]
def getRandomWeaponClassName():
	return WEAPON_SUB_TYPES[random.randrange(0,len(WEAPON_SUB_TYPES))]
def getRandomArmorClassName():
	return ARMOR_SUB_TYPES[random.randrange(0,len(ARMOR_SUB_TYPES))]
def getRandomItemClassName():
	_type = GEAR_TYPE_CHAINMAIL
	item = getRandomArmorClassName()
	if random.randrange(0,10) > 4:
		item = getRandomWeaponClassName()
		_type = GEAR_TYPE_NONE
	grade = getRandomGrade()
	return "%s%s%s" % (grade,_type,item)
def getRandomItemWithSpecificGrade(grade):
	_type = GEAR_TYPE_CHAINMAIL
	item = getRandomArmorClassName()
	if random.randrange(0,10) > 4:
		item = getRandomWeaponClassName()
		_type = GEAR_TYPE_NONE
	return "%s%s%s" % (grade,_type,item)







