from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, JsonResponse
from django.shortcuts import render
from pong.models import User
from .queries_relationship import *

def get_relationships_context(user: User):
	friends = get_friends_list(user)
	friends.sort(key=lambda usr: usr.display_name.lower())

	sent_requests = [
		User.objects.get(pk=user_id) for user_id in list(get_sent_requests_qlist(user))
		]

	received_requests = [
		User.objects.get(pk=user_id) for user_id in list(get_received_requests_qlist(user))
		]

	context = {
		'friends': friends,
		'sent_requests': sent_requests,
		'received_requests': received_requests
	}
	return context
