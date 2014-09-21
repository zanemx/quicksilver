#!/usr/bin/env python
import random
import math
from copy import copy
from core.constants import *

def parseClassName(x):
	grade = GRADE_COMMON
	_type = GEAR_ARMOR
	subType = GEAR_HEAD
	gearType = GEAR_TYPE_NONE

	for v in ARMOR_SUB_TYPES:
		if x.endswith(v):
			subType = v
			_type = GEAR_ARMOR

	for v in WEAPON_SUB_TYPES:
		if x.endswith(v):
			subType = v
			_type = GEAR_WEAPON

	for v in GRADES:
		if x.startswith(v):
			grade = v

	if x.find('chainmail')>-1:
		gearType = GEAR_TYPE_CHAINMAIL
	elif x.find('cloth')>-1:
		gearType = GEAR_TYPE_CLOTH

	return {
		'grade':grade,
		'_type':_type,
		'subType':subType,
		'gearType':gearType
	}

def createItemFromClassName(toon,_className):
	
	level = toon.level

	details = parseClassName(_className)
	_type = details['_type']
 	grade = details['grade']
 	subType = details['subType']
 	gearType = details['gearType']
 	className = _className
 	stats = {}

	# r = random.randrange(0,6)
	# # ARMOR TYPE
	# if r > 1: 
	# 	_type =GEAR_ARMOR
	# 	subType = ARMOR_SUB_TYPES[random.randrange(0,len(ARMOR_SUB_TYPES))]
	# 	gearType = GEAR_TYPE_CHAINMAIL

	# # WEAPON TYPE
	# else:
	# 	_type = GEAR_WEAPON
	# 	subType = WEAPON_SUB_TYPES[random.randrange(0,len(WEAPON_SUB_TYPES))]
	# 	gearType = GEAR_TYPE_NONE

	# calculate grade 
	# r = random.randrange(0,101)
	grade_modifier = 1
	# variation = random.randrange(0,60) - 30) * 0.01# +- 30
	if grade == GRADE_EPIC:
		grade_modifier = 1.4
		cp = copy(BASE_STATS)
		while len(cp)>0:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
	elif grade == GRADE_RARE:
		grade_modifier=1.3
		cp = copy(BASE_STATS)
		while len(cp)>1:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
	elif grade == GRADE_UNCOMMON:
		grade_modifier=1.2
		cp = copy(BASE_STATS)
		while len(cp)>2:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
	else:
		grade_modifier=1.1
		cp = copy(BASE_STATS)
		while len(cp)>3:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)

	# GENERATE NAME
	tagNames =TAG_NAMES[grade]
	tagName = tagNames[random.randrange(0,len(tagNames))]
	name = "%s %s %s" % (grade.capitalize(), subType.capitalize(), tagName)

	# GENERATE CLASS NAME FOR ICON FROM SPRITESHEET
	# className = "%s%s%s" % (grade, gearType, subType)
	# commonchainmailchest

	color = GRADE_COLORS[grade]

	item = {}
	item['type'] = _type
	item['grade'] = grade
	item['subType']= subType
	item['gearType'] = gearType
	item['level'] = level
	item['name'] = item['title'] = name
	item['className'] = className
	item['color'] = color
	item['price'] = level * INT_FOR_GRADE[grade] * {'epic':15,'rare':10,'uncommon':5,'common':100}[grade]


	for k,v in stats.iteritems():
		item[k] =v

	return item

def grantRandomItem(toon,level=None):

	if not level:
		level = toon.level

	_type = None
 	grade = None
 	subType = None
 	gearType = None
 	className = None
 	stats = {}

	r = random.randrange(0,6)
	# ARMOR TYPE
	if r > 1: 
		_type =GEAR_ARMOR
		subType = ARMOR_SUB_TYPES[random.randrange(0,len(ARMOR_SUB_TYPES))]
		gearType = GEAR_TYPE_CHAINMAIL

	# WEAPON TYPE
	else:
		_type = GEAR_WEAPON
		subType = WEAPON_SUB_TYPES[random.randrange(0,len(WEAPON_SUB_TYPES))]
		gearType = GEAR_TYPE_NONE

	# calculate grade 
	r = random.randrange(0,101)
	grade_modifier = 1
	# variation = random.randrange(0,60) - 30) * 0.01# +- 30
	if r >99:
		grade =GRADE_EPIC
		grade_modifier = 1.4
		cp = copy(BASE_STATS)
		while len(cp)>0:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
	elif r >94:
		grade=GRADE_RARE
		grade_modifier=1.3
		cp = copy(BASE_STATS)
		while len(cp)>1:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
	elif r > 79:
		grade=GRADE_UNCOMMON
		grade_modifier=1.2
		cp = copy(BASE_STATS)
		while len(cp)>2:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
	else:
		grade=GRADE_COMMON
		grade_modifier=1.1
		cp = copy(BASE_STATS)
		while len(cp)>3:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)

	# GENERATE NAME
	tagNames =TAG_NAMES[grade]
	tagName = tagNames[random.randrange(0,len(tagNames))]
	name = "%s %s %s" % (grade.capitalize(), subType.capitalize(), tagName)

	# GENERATE CLASS NAME FOR ICON FROM SPRITESHEET
	className = "%s%s%s" % (grade, gearType, subType)
	# commonchainmailchest

	color = GRADE_COLORS[grade]

	item = {}
	item['type'] = _type
	item['grade'] = grade
	item['subType']= subType
	item['gearType'] = gearType
	item['level'] = level
	item['name'] = item['title'] = name
	item['className'] = className
	item['color'] = color
	item['price'] = level * INT_FOR_GRADE[grade] * {'epic':15,'rare':10,'uncommon':5,'common':100}[grade]


	for k,v in stats.iteritems():
		item[k] =v

	return item

def createItemByLevelAndGrade(level, grade):

	_type = None
 	subType = None
 	gearType = None
 	className = None
 	stats = {}

	r = random.randrange(0,6)
	# ARMOR TYPE
	if r > 1: 
		_type =GEAR_ARMOR
		subType = ARMOR_SUB_TYPES[random.randrange(0,len(ARMOR_SUB_TYPES))]
		gearType = GEAR_TYPE_CHAINMAIL

	# WEAPON TYPE
	else:
		_type = GEAR_WEAPON
		subType = WEAPON_SUB_TYPES[random.randrange(0,len(WEAPON_SUB_TYPES))]
		gearType = GEAR_TYPE_NONE

	# calculate grade 
	r = random.randrange(0,101)
	grade_modifier = 1
	# variation = random.randrange(0,60) - 30) * 0.01# +- 30
	if grade == GRADE_EPIC:
		grade_modifier = 1.4
		cp = copy(BASE_STATS)
		while len(cp)>0:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
	elif grade == GRADE_RARE:
		grade_modifier=1.3
		cp = copy(BASE_STATS)
		while len(cp)>1:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
	elif grade == GRADE_UNCOMMON:
		grade_modifier=1.2
		cp = copy(BASE_STATS)
		while len(cp)>2:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)
	else:
		grade_modifier=1.1
		cp = copy(BASE_STATS)
		while len(cp)>3:
			random.shuffle(cp)
			stats[cp.pop()] = math.ceil((level + (level * ((random.randrange(0,60) - 30) * 0.01))) * grade_modifier)

	# GENERATE NAME
	tagNames =TAG_NAMES[grade]
	tagName = tagNames[random.randrange(0,len(tagNames))]
	name = "%s %s %s" % (grade.capitalize(), subType.capitalize(), tagName)

	# GENERATE CLASS NAME FOR ICON FROM SPRITESHEET
	className = "%s%s%s" % (grade, gearType, subType)
	# commonchainmailchest

	color = GRADE_COLORS[grade]

	item = {}
	item['type'] = _type
	item['grade'] = grade
	item['subType']= subType
	item['gearType'] = gearType
	item['level'] = level
	item['name'] = item['title'] = name
	item['className'] = className
	item['color'] = color
	item['price'] = level * INT_FOR_GRADE[grade] * {'epic':15,'rare':10,'uncommon':5,'common':100}[grade]


	for k,v in stats.iteritems():
		item[k] =v

	return item

