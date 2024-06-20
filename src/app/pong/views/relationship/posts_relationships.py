from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import HttpRequest, JsonResponse
from pong.models import Relationship, User
from .queries_relationship import *

@login_required(login_url="/login")
def deny_friend_request(request: HttpRequest):
	return remove_friend(request)

@login_required(login_url="/login")
def remove_friend(request: HttpRequest):
	if request.method != "POST":
		return JsonResponse({'error': 'Invalid request method'}, status=400)

	friend_id = request.POST.get('friend_id')
	try:
		if friend_id is None:
			raise Exception("'friend_id' is empty")
		if not isinstance(request.user, User):
			raise Exception("Authentication failed to provide a valid user")

		friend = User.objects.get(pk=friend_id)
		user = request.user

		friendship = Relationship.objects.get(
			Q(user1=user, user2=friend) | Q(user1=friend, user2=user)
		)
		friendship.delete()

	except Exception as e:
		return JsonResponse({
			'success': False,
			'message': f'{e}'
		}, status=400)

	return JsonResponse({
		'success': True,
		'message': 'Friend removed'
	})

@login_required(login_url="/login")
def accept_friend_request(request: HttpRequest):
	if request.method != "POST":
		return JsonResponse({'error': 'Invalid request method'}, status=400)

	friend_id = request.POST.get('friend_id')
	try:
		if friend_id is None:
			raise Exception("'friend_id' is empty")
		if not isinstance(request.user, User):
			raise Exception("Authentication failed to provide a valid user")

		friend = User.objects.get(pk=friend_id)
		user = request.user
		is_friend = Relationship.objects.filter(
			Q(user1=user.pk,user2=friend.pk) | Q(user1=friend.pk,user2=user.pk),
			user1_is_friendly=True, user2_is_friendly=True
			).exists()
		if is_friend:
			raise Exception("Already friends")
		if get_sent_requests_qlist(user).filter(user2=friend.pk):
			raise Exception("A friend request was already sent by you to this user")

		friendship = Relationship.objects.get(user1=friend.pk, user2=user.pk)
		friendship.user2_is_friendly = True
		friendship.save()

	except Exception as e:
		return JsonResponse({
			'success': False,
			'message': f'{e}'
		}, status=400)

	return JsonResponse({
		'success': True,
		'message': 'Friend request accepted'
	})

@login_required(login_url="/login")
def send_friend_request(request: HttpRequest):
	if request.method != "POST":
		return JsonResponse({'error': 'Invalid request method'}, status=400)

	friend_name = request.POST.get('friend_name')
	try:
		if friend_name is None:
			raise Exception("'friend_name' is empty")
		if not isinstance(request.user, User):
			raise Exception("Authentication failed to provide a valid user")

		friend = User.objects.get(display_name=friend_name)
		user = request.user
		if user == friend:
			raise Exception("You cannot add yourself as a friend")

		is_friend = Relationship.objects.filter(
			Q(user1=user.pk,user2=friend.pk) | Q(user1=friend.pk,user2=user.pk),
			user1_is_friendly=True, user2_is_friendly=True
			).exists()
		if is_friend:
			raise Exception("Already friends")
		if get_sent_requests_qlist(user).filter(user2=friend.pk):
			raise Exception("A friend request was already sent")

		relationship = get_received_requests_qlist(user).filter(user1=friend.pk)
		if relationship.exists():
			friendship = Relationship.objects.get(user1=friend.pk, user2=user.pk)
			friendship.user2_is_friendly = True
		else:
			friendship = Relationship(user1=user, user2=friend)
		friendship.save()

	except Exception as e:
		return JsonResponse({
			'success': False,
			'message': f'{e}'
		}, status=400)

	return JsonResponse({
		'success': True,
		'message': 'Friend request sent'
	})
