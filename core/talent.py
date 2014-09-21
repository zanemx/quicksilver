#!/usr/bin/env python
from lxml import etree
import logging

xml = """<?xml version="1.0" encoding="utf-8" ?>

<!-- 
	name the xlm file the same as the class it's for : priest, knight, palidin . . . no caps
	the number of descriptions attributes must be the value of maxLevel + 1
-->

<skillTree>
	
	<!-- ROW ONE OF THE SKILL TREE-->
	<row>
		
		<skill	name="Skill Mastery"	requiredPoints="0" maxLevel="5" iconUrl="abilities/accuracy.png">
			<desc>Increases the characters chance to use a learned skill by 1%</desc>
			<desc>Increases the characters chance to use a learned skill by 2%</desc>
			<desc>Increases the characters chance to use a learned skill by 3%</desc>
			<desc>Increases the characters chance to use a learned skill by 4%</desc>
			<desc>Increases the characters chance to use a learned skill by 5%</desc>
			<desc>This skill is fully upgraded. Increases the characters chance to use a learned skill by 5%.</desc>
		</skill>
		
		<skill	name="Improved Will"	requiredPoints="0" maxLevel="5" iconUrl="abilities/improved_will.png">
			<desc>current bonus: 0% increase of total Will, next point increases total Will by 1%</desc>
			<desc>current bonus: 1% increase of total Will, next point increases total Will by 2%</desc>
			<desc>current bonus: 2% increase of total Will, next point increases total Will by 3%</desc>
			<desc>current bonus: 3% increase of total Will, next point increases total Will by 4%</desc>
			<desc>current bonus: 4% increase of total Will, next point increases total Will by 5%</desc>
			<desc>current bonus: 5% increase of total Will, Fully Upgraded</desc>
		</skill>
		
		<skill	name="Improved Stamina"	requiredPoints="0" maxLevel="5" iconUrl="abilities/improved_stamina.png">
			<desc>current bonus: 0% increase of total Stamina, next point increases total Stamina by 1%</desc>
			<desc>current bonus: 1% increase of total Stamina, next point increases total stamina by 2%</desc>
			<desc>current bonus: 2% increase of total Stamina, next point increases total stamina by 3%</desc>
			<desc>current bonus: 3% increase of total Stamina, next point increases total stamina by 4%</desc>
			<desc>current bonus: 4% increase of total Stamina, next point increases total stamina by 5%</desc>
			<desc>current bonus: 5% increase of total Stamina, Fully Upgraded</desc>
		</skill>
		
	</row>
	
	<!-- ROW TWO OF THE SKILL TREE-->
	<row>
		
		<skill	name="Fast Reflexes"	requiredPoints="5" maxLevel="5" iconUrl="abilities/fast_reflexes.png">
			<desc>current bonus: 0% increase to dodge, next point increases dodge by 1%</desc>
			<desc>current bonus: 1% increase to dodge, next point increases dodge by 2%</desc>
			<desc>current bonus: 2% increase to dodge, next point increases dodge by 3%</desc>
			<desc>current bonus: 3% increase to dodge, next point increases dodge by 4%</desc>
			<desc>current bonus: 4% increase to dodge, next point increases dodge by 5%</desc>
			<desc>current bonus: 5% increase to dodge, Fully Upgraded</desc>
		</skill>
		
		<skill	name="Exceptional Resistance"	requiredPoints="5" maxLevel="5" iconUrl="abilities/exceptional_resistance.png">
			<desc>current bonus: 0% increase to Resist Magic, next point increases Resist Magic by 1%</desc>
			<desc>current bonus: 1% increase to Resist Magic, next point increases Resist Magic by 2%</desc>
			<desc>current bonus: 2% increase to Resist Magic, next point increases Resist Magic by 3%</desc>
			<desc>current bonus: 3% increase to Resist Magic, next point increases Resist Magic by 4%</desc>
			<desc>current bonus: 4% increase to Resist Magic, next point increases Resist Magic by 5%</desc>
			<desc>current bonus: 5% increase to Resist Magic, Fully Upgraded</desc>
		</skill>
		
		<skill	name="Accuracy"	requiredPoints="5" maxLevel="5" iconUrl="abilities/fireball_2.png">
			<desc>current bonus: 0%, next point increases critical strike by 1%</desc>
			<desc>current bonus: 1%, next point increases critical strike by 2%</desc>
			<desc>current bonus: 2%, next point increases critical strike by 3%</desc>
			<desc>current bonus: 3%, next point increases critical strike by 4%</desc>
			<desc>current bonus: 4%, next point increases critical strike by 5%</desc>
			<desc>current bonus: 5%, Fully Upgraded</desc>
		</skill>
		
	</row>
	
	
	<!-- ROW 3 OF THE SKILL TREE-->
	<row>
		
		<skill	name="Vengence Rising"	requiredPoints="10" maxLevel="5" iconUrl="abilities/unbreakable_will.png">
			<desc>current bonus: 0% increased chance to hit with Vengence, next point increases chance to hit with Vengence by 1%</desc>
			<desc>current bonus: 1% increased chance to hit with Vengence, next point increases chance to hit with Vengence by 2%</desc>
			<desc>current bonus: 2% increased chance to hit with Vengence, next point increases chance to hit with Vengence by 3%</desc>
			<desc>current bonus: 3% increased chance to hit with Vengence, next point increases chance to hit with Vengence by 4%</desc>
			<desc>current bonus: 4% increased chance to hit with Vengence, next point increases chance to hit with Vengence by 5%</desc>
			<desc>current bonus: 5% increased chance to hit with Vengence, Fully Upgraded</desc>
		</skill>
		
		<skill	name="Purified Flurry"	requiredPoints="10" maxLevel="1" iconUrl="abilities/improved_magical_force.png">
			<desc>This ability allows the paladin a chance to get three strikes in against an enemy instead of a single attack. These strikes are treated like normal attacks</desc>
			<desc>Fully Upgraded</desc>
		</skill>
		
		<skill	name="Greater Sanctity"	requiredPoints="10" maxLevel="5" iconUrl="abilities/intervention.png">
			<desc>current bonus: 0% incresed chance to hit with Sanctity, next point increases chance to hit with Sanctity by 1%</desc>
			<desc>current bonus: 1% incresed chance to hit with Sanctity, next point increases chance to hit with Sanctity by 2%</desc>
			<desc>current bonus: 2% incresed chance to hit with Sanctity, next point increases chance to hit with Sanctity by 3%</desc>
			<desc>current bonus: 3% incresed chance to hit with Sanctity, next point increases chance to hit with Sanctity by 4%</desc>
			<desc>current bonus: 4% incresed chance to hit with Sanctity, next point increases chance to hit with Sanctity by 5%</desc>
			<desc>current bonus: 5% incresed chance to hit with Sanctity, Fully Upgraded</desc>
		</skill>
		
	</row>
	
	<!-- ROW 4 OF THE SKILL TREE-->
	<row>
		
		<skill	name="Saintly Armor"	requiredPoints="15" maxLevel="1" iconUrl="abilities/shield.png">
			<desc>This talent instantly doubles the Paladins armor.</desc>
			<desc>Fully Upgraded. This talent instantly doubles Paladins armor.</desc>
		</skill>
		
	</row>
	

		

</skillTree>
"""

root = etree.fromstring(xml)
print(root.tag)

for descendant in root.iterdescendants():
	logging.inf(descendant)