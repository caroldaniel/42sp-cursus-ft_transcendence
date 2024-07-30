from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.views.decorators.cache import cache_control

from pong.views.views_match_history import get_match_history_context
from pong.models import User, Match


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
	context = get_match_history_context(request.user)
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

	context = get_match_history_context(user)
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/stats.html", context)
	return render(request, "sections/stats.html", context)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_tournament_page(request):
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/tournament.html")
	return render(request, "sections/tournament.html")

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_tournament_form_page(request):
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/tournamentForm.html")
	return render(request, "sections/tournamentForm.html")

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_tournament_game_page(request):
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/tournamentGame.html")
	return render(request, "sections/tournamentGame.html")

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_winner_page(request):
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/winner.html")
	return render(request, "sections/winner.html")

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_profile_page(request):
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/profile.html")
	return render(request, "sections/profile.html")

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def load_templates(request):
    return render(request, 'components/modals/editProfileTemplates.html')