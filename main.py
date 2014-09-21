#!/usr/bin/env python
import os
import webapp2
from google.appengine.ext.webapp import template
from core.basehandler import BaseHandler
from core.ajax import Ajax
from core.questmanager import QuestManager
# from core.questmaker import QuestMaker


class MainPage(BaseHandler):
	def get(self):
		path = os.path.join(os.path.dirname(__file__), 'index.html')
		self.response.out.write(template.render(path, None))

class Feedback(BaseHandler):
	def get(self):
		path = os.path.join(os.path.dirname(__file__), 'feedback.html')
		self.response.out.write(template.render(path, None))


		
config = {}
config['webapp2_extras.sessions'] = {
	'secret_key':'quicksilver_is_all_mighty',
}
app = webapp2.WSGIApplication(
	[

		# ('/questmaker',QuestMaker),

		('/ajax',Ajax),
		('/', MainPage),
		('/feedback',Feedback),
		('/questmanager',QuestManager)
	],
	config=config,
	debug=True
)
