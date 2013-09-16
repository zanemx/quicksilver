#!/usr/bin/env python
import webapp2
import json
import os
import logging
from models import *
from google.appengine.ext import db
from p12utils import *

class Quest(object):
	def __init__(self,name,description,steps,gold,essence,energy,exp):
		self.name = name
		self.description = description
		self.steps = steps
		self.gold = gold
		self.essence = essence
		self.energy = energy
		self.exp = exp

	def toDict(self):
		return self.__dict__


QUESTS = {}
QUESTS[1]=[
	Quest(name='Dust in the wind',description="There's strange things in the fields. Recon the area for a reward.",steps=4,	gold=10,essence=1,energy=0,exp=10),
	Quest(name='A wind storm',description="There's strange things in the fields. Recon the area for a reward.",steps=3,		gold=10,essence=1,energy=0,exp=10),
	Quest(name='Battle to the bone',description="There's strange things in the fields. Recon the area for a reward.",steps=4,	gold=10,essence=1,energy=0,exp=10),
	Quest(name='Finding the entrance',description="Find the entrance to his layer before all hell breaks loose.",steps=5,		gold=10,essence=1,energy=0,exp=10),
	Quest(name='Into the lions den',description="Find the entrance to his layer before all hell breaks loose.",steps=6,		gold=10,essence=1,energy=0,exp=10),
	Quest(name='Mardorok Mackduron',description="Kill the beast!",steps=10,													gold=10,essence=1,energy=0,exp=10)
]