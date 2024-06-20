from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, JsonResponse
from pong.models import MatchHistory, Relationship, User

def create_user_list(number_of_users: int):
	user_list: list[User] = []
	for index in range(number_of_users):
		new_user = User(intra_name=f'NotRealUser{index}')
		if index % 2:
			new_user.is_online = True
		new_user.save()
		user_list.append(new_user)
	return user_list

@login_required(login_url="/login")
def populate_db(request: HttpRequest):
	if request.method != "GET":
		return JsonResponse({'error': 'Invalid request method'}, status=400)
	if not isinstance(request.user, User):
		return JsonResponse({
			'error': 'Authentication failed to provide a valid user'
			}, status=403)

	try:
		# Check for a unique marker user to validate if database was already populated
		marker_name = 'database-populator'
		if User.objects.filter(intra_name=marker_name).exists():
			raise Exception('Database already populated')
		db_user = User(intra_name=marker_name)
		db_user.save()

		user = request.user

		# Create users
		user_list = create_user_list(12)

		for index in range(len(user_list)):
			if index < len(user_list) / 3:
				# Create user's received friend requests
				user_received_relation = Relationship(user1=user_list[index], user2=user)
				user_received_relation.save()
			elif index < 2 * len(user_list) / 3:
				# Create user's sent and unanswered friend request
				user_sent_relation = Relationship(user1=user, user2=user_list[index])
				user_sent_relation.save()
			else:
				# Create user's friends
				friends = Relationship(user1=user, user2=user_list[index], user2_is_friendly=True)
				friends.save()

			if index % 2:
				# Create user's victories
				match = MatchHistory(
					user=user,
					user_score=5,
					opponent_display_name=user_list[index].display_name,
					opponent_score=(4 - index % 5)
					)
			else:
				# Create user's defeats
				match = MatchHistory(
					user=user,
					user_score=(4 - index % 5),
					opponent_display_name=user_list[index].display_name,
					opponent_score=5
					)
			match.save()

	except Exception as e:
		return JsonResponse({
			'success': False,
			'message': f'{e}'
		}, status=400)

	return JsonResponse({
		'success': True,
		'message': 'Database successfully populated'
	})
