#!/usr/bin/env python
import random

STRENGTH 		= 'strength'
INTELLIGENCE 	= 'intelligence'
DEFENSE 		= 'defense'
ENDURANCE 		= 'endurance'

GRADE_FACTOR = {
	'common':1,
	'uncommon':2,
	'rare':3,
	'epic':4
}

# def getIconUrl(grade,level,_type,kind,subtype):
# 	path = 'static/app/images/ui/icons/%s_%s_%s.png' % (grade,)


# 	if _type == 'weapons':
# 		path = '%sui/icons/weapons/%s/%s.png' % (path,grade,kind)
# 	elif:
# 		path = '%sui/icons/armor/%s' % (path,grade)
	

# ATTACH RANDOM STATE TO Stats model
# ONLY WORKS WITH MODELS THAT EXTEND THE EXPANDO CLASS
def attachStats(model,grade,level,_type):
	setattr(model,'name',"Level %i %s %s" % (level,grade,_type))
	setattr(model,STRENGTH,		GRADE_FACTOR[grade.lower()] * level)
	setattr(model,INTELLIGENCE,	GRADE_FACTOR[grade.lower()] * level)
	setattr(model,DEFENSE,		GRADE_FACTOR[grade.lower()] * level)
	setattr(model,ENDURANCE,	GRADE_FACTOR[grade.lower()] * level)
	setattr(model,'grade',grade)
	setattr(model,'level',level)
	setattr(model,'type',_type)