#!/usr/bin/env python
# from google.appengine.ext import ndb

# QUEST_ACTION_EXPLORE='Explore'
# QUEST_ACTION_ATTACK="Attack"
# 
# QUEST_PHYSICAL = 'physical'
# QUEST_MENTAL = 'mental'

# def getQuestChain(chainid):
# 	return QUESTS[chainid]
# def getQuest(chainid,chainlink):
# 	if chainlink < len(QUESTS[chainid]):
# 		return QUESTS[chainid][chainlink] #.toDict()
# 	return None
# def getNext(chainid,chainlink):

# 	# ADVANCE CHAIN LINK
# 	x = chainlink+1
# 	if x < len(QUESTS[chainid]):
# 		return (chainid,x)

# 	#ADVANCE CHAIN 
# 	x = chainid+1
# 	if x < len(QUESTS):
# 		return (x,0)

# 	# START OVER
# 	return (0,0)

# class QSQuest(object):
# 	def __init__(self):
# 		self.type = QUEST_PHYSICAL
# 		self.percentTotal = 100
# 		self.onInit()
# 	def toDict(self):
# 		d = self.__dict__
# 		d['reward'] = self.reward
# 		return d

# 	@property
# 	def reward(self):
# 		reward = []
# 		for rid in self._reward:
# 			item = rid
# 			if type(rid) == str:
# 				item = ndb.Key('InventoryItem',rid).get().toDict()
# 			reward.append(item)
# 		return reward