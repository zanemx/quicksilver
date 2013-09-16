#!/usr/bin/env python
import webapp2
from google.appengine.ext import db
import json
import os
import webapp2
import logging
import time
from datetime import datetime,timedelta,tzinfo
from basehandler import BaseHandler
from ajax import Ajax
from google.appengine.api import urlfetch
from google.appengine.ext.webapp import template
from controllers import *

import logging


class MainPage(BaseHandler):

	def get(self):
		# self.response.headers("content-type")
		path = os.path.join(os.path.dirname(__file__), 'index.html')
		# logging.info(path)
		self.response.out.write(template.render(path, None))

class Admin(BaseHandler):
	 def get (self):
		tp = jinja_environment.get_template('admin.html')
		self.response.out.write(tp.render({}))
		
config = {}
config['webapp2_extras.sessions'] = {
	'secret_key':'quicksilver_is_all_mighty',
}
app = webapp2.WSGIApplication(
	[
		('/ajax',Ajax),
		('/admin',Admin),
		('/user\/?([a-zA-Z0-9-_]*)', UserHandler),
		('/character', CharacterHandler),
		('/character\/?([a-zA-Z0-9-_]*)', CharacterHandler),
		('/inventory\/?([a-zA-Z0-9-_]*)', InventoryHandler),
		('/guild\/?([a-zA-Z0-9-_]*)', GuildHandler),
		('/quest\/?([a-zA-Z0-9-_]*)', QuestHandler),
		('/news', NewsHandler),
		('/', MainPage),
	],
	config=config,
	debug=True
)