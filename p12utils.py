#!/usr/bin/env python
import json
import logging
import time
from datetime import datetime
from google.appengine.ext.db import Key

class ComplexEncoder(json.JSONEncoder):
	def default(self,obj):
		if isinstance(obj,datetime):
			return obj.isoformat()
		if isinstance(obj,Key):
			return ''
		return json.JSONEncoder.default(self,obj)

class p12Encoder():
	@staticmethod
	def encode(data):# to json string
		result = json.dumps(data,cls=ComplexEncoder)
		return result

class Utils():
	@staticmethod
	def log(msg):
		logging.info('---------START-------')
		logging.info(msg)
		logging.info('---------END---------')

	@staticmethod
	def stringToDatetime(dateStringUsing_str_cast):
		result = datetime.strptime(dateStringUsing_str_cast,'%Y-%m-%d %H:%M:%S.%f')
		return result