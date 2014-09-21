#!/usr/bin/env python

def specFromStats(strength,intelligence):
	spec = 'druid'
	strongStat = intelligence
	weakStat = strength
	if strength > intelligence:
		strongStat = strength
		weakStat = intelligence
	variation = (float(strongStat)-float(weakStat))*0.01
	
	if variation >= 0.3:
		spec = 'warrior' if strength > intelligence else 'wizard'

	return spec.capitalize()