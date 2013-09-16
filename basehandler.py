#!/usr/bin/env python
import webapp2
import logging
from webapp2_extras import sessions
# from models.models import User


class BaseHandler(webapp2.RequestHandler):

	isLocal = False

	def dispatch(self):
		
		if 'local' in self.request.url:
			self.isLocal = True

		self.session_store = sessions.get_store(request=self.request)

		try:
			webapp2.RequestHandler.dispatch(self)
		finally:
			self.session_store.save_sessions(self.response)

	@webapp2.cached_property
	def session(self):
		return self.session_store.get_session()

	# def checkUser(self,ref):
	# 	if 'uid' not in self.session:
	# 		self.redirect('/signin')
	# 	else:
	# 		user = User.get_by_key_name(key_names=self.session['uid'])
	# 		if not user:
	# 			if ref:
	# 				self.redirect('/signin?ref=' + ref)
	# 			else:
	# 				self.redirect('/signin')