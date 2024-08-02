from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.views.decorators.cache import cache_control
from django.conf import settings
from pong.views.views_match import get_match_context
from pong.models import User, Match, Tournament, TournamentMatch


def get_login_page(request):
	if request.user.is_authenticated:
		return redirect("/")
	elif request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/login.html")
	else:
		return render(request, "sections/login.html")
	

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_home_page(request):
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/home.html")
	return render(request, "sections/home.html")


@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_game_setup_page(request):
	users = User.objects.all()
	context = {'users': users}
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/gameSetup.html", context)
	return render(request, "sections/gameSetup.html", context)


@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_game_page(request, match_id):
	match = Match.objects.get(pk=match_id)
	player1 = match.get_player1_display()
	player2 = match.get_player2_display()
	context = {'match': match, 'player1': player1, 'player2': player2}
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/game.html", context)
	return render(request, "sections/game.html", context)


@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_user_game_page(request, user_id):
	try:
		user = User.objects.get(pk=user_id)
		opponent_display_name = user.display_name
	except:
		opponent_display_name = None

	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/game.html", {"opponent_display_name": opponent_display_name})
	return render(request, "sections/game.html", {"opponent_display_name": opponent_display_name})

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_stats_page(request):
	if not isinstance(request.user, User):
		return redirect("/logout")
	context = get_match_context(request.user)
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/stats.html", context)
	return render(request, "sections/stats.html", context)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_user_stats_page(request, user_id):
	if not isinstance(request.user, User):
		return redirect("/logout")

	try:
		user = User.objects.get(pk=user_id)
	except:
		user = request.user

	context = get_match_context(user)
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/stats.html", context)
	return render(request, "sections/stats.html", context)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_tournament_page(request, tournament_id):
	# get tournament object
	tournament = Tournament.objects.get(pk=tournament_id)
	# get all tournament match ids, in an array, ordered by position
	tournament_matches = TournamentMatch.objects.filter(tournament=tournament).order_by('position')
	# get all tournament matches
	matches = [Match.objects.get(pk=tm.match_id) for tm in tournament_matches]
	context = {
		'tournament': tournament,
		'matches': matches
	}
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/tournament.html", context)
	return render(request, "sections/tournament.html", context)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_tournament_form_page(request):
	users = User.objects.all()
	context = {'users': users}
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/tournamentForm.html", context)
	return render(request, "sections/tournamentForm.html", context)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_tournament_game_page(request):
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/tournamentGame.html")
	return render(request, "sections/tournamentGame.html")

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_winner_page(request, tournament_id):
	tournament = Tournament.objects.get(pk=tournament_id)
	context = {'tournament': tournament}
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/winner.html", context)
	return render(request, "sections/winner.html", context)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_profile_page(request):
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/profile.html")
	return render(request, "sections/profile.html")

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def load_templates(request):
    return render(request, 'components/modals/editProfileTemplates.html')

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_user_profile_page(request, user_id):
	user = User.objects.get(pk=user_id)
	avatar_url = f'{settings.MEDIA_URL}{str(user.avatar)}' if user.avatar else f'{settings.MEDIA_URL}default.svg'

	context = {
		'username': user.username,
		'display_name': user.display_name,
		'email': user.email,
		'first_name': user.first_name,
		'last_name': user.last_name,
		'user_avatar': avatar_url		
	}
	return render(request, "components/modals/userProfile.html", context)