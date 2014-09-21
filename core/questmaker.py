#!/usr/bin/env python
import os
import webapp2
import logging
from google.appengine.ext.webapp import template
from core.basehandler import BaseHandler
from core.ajax import Ajax
class QuestMaker(webapp2.RequestHandler):

	def get(self):
		path = os.path.join(os.path.dirname(__file__), '../questmaker.html')
		self.response.out.write(template.render(path, None))
		