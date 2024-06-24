import numbers
from django.contrib.auth.decorators import login_required
from django.db.models import F
from django.http import HttpRequest, JsonResponse
from pong.models import MatchHistory, User

def get_match_history_context(user: User):
	matches = MatchHistory.objects.filter(user=user).order_by('-finished_at')
	victories = matches.filter(user_score__gt=F('opponent_score')).count()
	losses = matches.filter(user_score__lt=F('opponent_score')).count()

	return {
		'matches': matches,
		'victories': victories,
		'losses': losses,
	}

@login_required(login_url="/login")
def register_match(request: HttpRequest):
	if request.method != "POST":
		return JsonResponse({'error': 'Invalid request method'}, status=400)

	user_score = request.POST.get('user_score')
	user_display_name = request.POST.get('user_display_name')
	opponent_display_name = request.POST.get('opponent_display_name')
	opponent_score = request.POST.get('opponent_score')

	try:
		if not isinstance(request.user, User):
			raise Exception("Authentication failed to provide a valid user")

		if user_score is None:
			raise Exception("Missing field: user_score")
		if not isinstance(int(user_score), numbers.Number):
			raise Exception("User score must be a number")

		if opponent_score is None:
			raise Exception("Missing field: opponent_score")
		if not isinstance(int(opponent_score), numbers.Number):
			raise Exception("User score must be a number")

		if opponent_display_name is None:
			raise Exception("Missing field: opponent_display_name")
		if len(opponent_display_name) < 3 and len(opponent_display_name) >= 20:
			raise Exception("Opponent display name must be a valid string")

		user = request.user
		if user_display_name is None:
			match = MatchHistory(
				user=user, user_display_name=user.display_name, user_score=int(user_score),
				opponent_display_name=opponent_display_name, opponent_score=int(opponent_score)
				)
		else:
			match = MatchHistory(
				user=user, user_display_name=user_display_name, user_score=int(user_score),
				opponent_display_name=opponent_display_name, opponent_score=int(opponent_score)
				)
		match.save()

	except Exception as e:
		return JsonResponse({
			'success': False,
			'message': f'{e}'
		}, status=400)

	return JsonResponse({
		'success': True,
		'message': 'Friend removed'
	})
