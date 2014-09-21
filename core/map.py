#!/usr/bin/env python
import re
import logging
from core.models import ChainQuest,Quest

class Place(object):
	def __init__(self):
		self.name = self.__class__.__name__
		self.prettyName = re.sub(r"(\w)([A-Z])", r"\1 \2", self.__class__.__name__)
		self.npc_image = None
		self.exits = []
		self.backExit = None
		self.mapPath = 'static/app/images/ui/maps/'
		self.level = 1
		self.onInit()

	def _getChains(self):
		q = ChainQuest().query().filter(ChainQuest.location == self.name)
		return [x.toDict() for x in q]
		
	def toDict(self):
		d = self.__dict__
		d['chains'] = self._getChains()
		return d

	def addExit(self,name,left,top):
		self.exits.append({
				'name':name,
				'left':left,
				'top':top
			})
	def addBackExit(self,name):
		self.backExit = name
	def addMap(self,className):
		# path = 'static/app/images/ui/maps/'
		# self.map = '%s%s' % (path,url)
		self.map = className

class NPCPlace(Place):
	def __init__(self):
		self.greeting = "Good day friend."
		# call super class init
		super(NPCPlace,self).__init__() # or use Place.__init__(self)

class DungeonPlace(Place):
	def __init__(self):
		self.greeting = "Prepare yourself soldier"
		super(DungeonPlace,self).__init__()

class Paralelliea(Place):
	def onInit(self):
		self.addExit("Red Forest",30,30)

class RedForest(Place):
	def onInit(self):
		self.addMap('redForest')
		# self.addBackExit('Paralelliea')
		self.addExit('Training Grounds',25,15)
		self.addExit('Finkeep Castle',35,19)
		self.addExit('Freeboro',47,23)
		self.addExit('Divinion Acres',59,15)
		self.addExit('Worm Field',63,35)
		self.addExit('Saints Rest',59,55)
		self.addExit('Icken Bog',49,56)
		self.addExit('Befallen Lambton',39,48)
		self.addExit('Crystalline Caverns',25,50)



# FINKEEP CASTLE
class FinkeepCastle(Place):
	def onInit(self):
		self.addMap('finkeepCastle')
		self.addBackExit("Red Forest")
		self.level = 2
		self.addExit('Edwin Mercen',40,20)
		self.addExit('Sam The Merchant',25,20)
		self.addExit('Luke Dynel',60,20)
		self.addExit('Bill Fountain',38,60)
		self.addExit('Delorna Peabody',50,30)
		self.addExit('Glenda Founden',60,50)
		self.addExit('Charles Fin',30,40)
class EdwinMercen(NPCPlace):
	def onInit(self):
		self.greeting = """Hello traveler. Welcome to Finkeep Castle."""
		self.addBackExit('Finkeep Castle')
		self.npc_image = 'human_male'
		self.level = 2
class SamTheMerchant(NPCPlace):
	def onInit(self):
		self.greeting = """Hello traveler. Welcome to Finkeep Castle."""
		self.addBackExit('Finkeep Castle')
		self.npc_image = 'human_male'
		self.level = 2
class LukeDynel(NPCPlace):
	def onInit(self):
		self.greeting = """Hello traveler. Welcome to Finkeep Castle."""
		self.addBackExit('Finkeep Castle')
		self.npc_image = 'human_male'
		self.level = 2
class BillFountain(NPCPlace):
	def onInit(self):
		self.greeting = """Hello traveler. Welcome to Finkeep Castle."""
		self.addBackExit('Finkeep Castle')
		self.npc_image = 'human_male'
		self.level = 2
class DelornaPeabody(NPCPlace):
	def onInit(self):
		self.greeting = """Hello traveler. Welcome to Finkeep Castle."""
		self.addBackExit('Finkeep Castle')
		self.npc_image = 'human_male'
		self.level = 2
class GlendaFounden(NPCPlace):
	def onInit(self):
		self.greeting = """Hello traveler. Welcome to Finkeep Castle."""
		self.addBackExit('Finkeep Castle')
		self.npc_image = 'human_male'
		self.level = 2
class CharlesFin(NPCPlace):
	def onInit(self):
		self.greeting = """Hello traveler. Welcome to Finkeep Castle."""
		self.addBackExit('Finkeep Castle')
		self.npc_image = 'human_male'
		self.level = 2

# TRAINING GROUNDS
class TrainingGrounds(Place):
	def onInit(self):
		self.addMap('trainingGrounds')
		self.addBackExit('Red Forest')
		self.addExit('Sergeant Mausen',50,20)
		self.addExit('Ren Kotan',30,40)
		self.addExit('Sky Warren',60,60)
		# self.addExit('Finkeep Dungeon',40,80)
		self.level = 1

class SergeantMausen(NPCPlace):
	def onInit(self):
		self.greeting = """Hello traveler. Welcome to the Crimson Valley training grounds."""
		self.addBackExit('Training Grounds')
		self.npc_image = 'human_male'
		self.level = 1

class RenKotan(NPCPlace):
	def onInit(self):
		self.addBackExit('Training Grounds')
		self.npc_image = 'dwarf_male'
		self.level = 1
		
class SkyWarren(NPCPlace):
	def onInit(self):
		self.addBackExit('Training Grounds')
		self.npc_image = 'elf_male'
		self.level = 1

class FinkeepDungeon(DungeonPlace):
	def onInit(self):
		self.addBackExit('Training Grounds')
		self.level = 1

# FREEBORO
class Freeboro(Place):
    def onInit(self):
		self.addMap('freeboro')
		self.level = 3
		self.addBackExit('Red Forest')
		self.addExit('Igor Tellenski',10,50);
		self.addExit('Paula Synda',50,20);
		self.addExit('Postmaster Smith',70,50);
		self.addExit('Captain Dougworth',40,70);

class IgorTellenski(NPCPlace):
	def onInit(self):
		self.addBackExit('Freeboro')
		self.npc_image = 'elf_male'
		self.level = 3
class PaulaSynda(NPCPlace):
	def onInit(self):
		self.addBackExit('Freeboro')
		self.npc_image = 'elf_male'
		self.level = 3
class PostmasterSmith(NPCPlace):
	def onInit(self):
		self.addBackExit('Freeboro')
		self.npc_image = 'elf_male'
		self.level = 3
class CaptainDougworth(NPCPlace):
	def onInit(self):
		self.addBackExit('Freeboro')
		self.npc_image = 'elf_male'
		self.level = 3

# DIVINIONACRES
class DivinionAcres(Place):
    def onInit(self):
		self.addMap('divinionAcres')
		self.level = 3
		self.addBackExit('Red Forest')
		self.addExit('Northern Field',30,20);
		self.addExit('Northeastern Field',64,16);
		self.addExit('Southern Field',50,50);
		self.addExit('Joseph Keller',60,30);
		self.addExit('Linden Sider',50,30);
		self.addExit('Sara Sider',40,60);
class NorthernField(NPCPlace):
	def onInit(self):
		self.level = 4
		self.addBackExit('Divinion Acres')
		self.npc_image='dwarf_male'
class NortheasternField(NPCPlace):
	def onInit(self):
		self.level = 4
		self.addBackExit('Divinion Acres')
		self.npc_image='dwarf_male'
class SouthernField(NPCPlace):
	def onInit(self):
		self.level = 4
		self.addBackExit('Divinion Acres')
		self.npc_image='dwarf_male'
class JosephKeller(NPCPlace):
	def onInit(self):
		self.level = 4
		self.addBackExit('Divinion Acres')
		self.npc_image='dwarf_male'
class LindenSider(NPCPlace):
	def onInit(self):
		self.level = 4
		self.addBackExit('Divinion Acres')
		self.npc_image='dwarf_male'
class SaraSider(NPCPlace):
	def onInit(self):
		self.level = 4
		self.addBackExit('Divinion Acres')
		self.npc_image='dwarf_male'


# WORMFIELD
class WormField(Place):
	def onInit(self):
		self.addMap('wormField')
		self.level = 5
		self.addBackExit('Red Forest')
		self.addExit('Withered Field',20,30)
		self.addExit('Saltons Field',32,34)
		self.addExit('Sallowed Field',65,40)
		self.addExit('Worms Well',24,55)
		self.addExit('Phillip Salton',60,60)


class WitheredField(NPCPlace):
	def onInit(self):
		self.level = 5
		self.addBackExit('Worm Field')
		self.npc_image='dwarf_male'


class SaltonsField(NPCPlace):
	def onInit(self):
		self.level = 5
		self.addBackExit('Worm Field')
		self.npc_image='dwarf_male'


class SallowedField(NPCPlace):
	def onInit(self):
		self.level = 5
		self.addBackExit('Worm Field')
		self.npc_image='dwarf_male'


class WormsWell(NPCPlace):
	def onInit(self):
		self.level = 5
		self.addBackExit('Worm Field')
		self.npc_image='dwarf_male'


class PhillipSalton(NPCPlace):
	def onInit(self):
		self.level = 5
		self.addBackExit('Worm Field')
		self.npc_image='dwarf_male'




# SAINTS REST
class SaintsRest(Place):
	def onInit(self):
		self.addMap('saintsRest')
		self.addBackExit('Red Forest')     
		self.addExit('Robert The Hermit',32,34)
		self.addExit('Commoners Graveyard',65,40)
		self.addExit('Lords Memory',24,55) 
		self.addExit('Warriors Echo',60,60)
		self.level = 6

class RobertTheHermit(NPCPlace):
	def onInit(self):
		self.level = 6
		self.addBackExit('Saints Rest')
		self.npc_image='elf_male'

class CommonersGraveyard(NPCPlace):
	def onInit(self):
		self.level = 6
		self.addBackExit('Saints Rest')
		self.npc_image='elf_male'

class LordsMemory(NPCPlace):
	def onInit(self):
		self.level = 6
		self.addBackExit('Saints Rest')
		self.npc_image='elf_male'

class WarriorsEcho(NPCPlace):
	def onInit(self):
		self.level = 6
		self.addBackExit('Saints Rest')
		self.npc_image='elf_male'

# ICKENBOG
class IckenBog(Place):
    def onInit(self):
    	self.addMap('river')
    	self.level = 7
    	self.addBackExit('Red Forest')

class IckenWaterElemental(NPCPlace):
    def onInit(self):
    		self.level = 7
    		self.npc_image='human_male'
    		self.addBackExit('Icken Bog')

# BEFALLEN LAMBTON
class BefallenLambton(Place):
	def onInit(self):
		self.addMap('city')
		self.level = 8
		self.addBackExit('Red Forest')
		self.addExit('Courton Mall',20,20)
		self.addExit('Swollen Arena',40,26)
		self.addExit('Sharels Institute',30,50)
		self.addExit('Sinkhole',70,30)
    
class CourtonMall(NPCPlace):
	def onInit(self):
		self.level = 8
		self.addBackExit('Befallen Lambton')
		self.npc_image='dwarf_male'
        
class SwollenArena(NPCPlace):
	def onInit(self):
		self.level = 8
		self.addBackExit('Befallen Lambton')
		self.npc_image='dwarf_male'
        
class SharelsInstitute(NPCPlace):
	def onInit(self):
		self.level = 8
		self.addBackExit('Befallen Lambton')
		self.npc_image='dwarf_male'
        
class Sinkhole(NPCPlace):
	def onInit(self):
		self.level = 8
		self.addBackExit('Befallen Lambton')
		self.npc_image='dwarf_male'


# CrystallineCaverns
class CrystallineCaverns(Place):
	def onInit(self):
		self.addMap('crystalCaverns')
		self.level = 9
		self.addBackExit('Red Forest')
		self.addExit('Borerag',20,20)
		self.addExit('Whinton Slayveil',20,40)
		self.addExit('Thinell Laven',40,30)

class Borerag(NPCPlace):
	def onInit(self):
		self.addBackExit('Crystalline Caverns')
		self.level =9 
		self.npc_image='elf_male'

class WhintonSlayveil(NPCPlace):
	def onInit(self):
		self.addBackExit('Crystalline Caverns')
		self.level =9 
		self.npc_image='elf_male'

class ThinellLaven(NPCPlace):
	def onInit(self):
		self.addBackExit('Crystalline Caverns')
		self.level =9 
		self.npc_image='elf_male'