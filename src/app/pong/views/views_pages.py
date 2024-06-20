from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.views.decorators.cache import cache_control

from pong.views.views_match_history import get_match_history_context
from .relationship.views_relationships import get_relationships_context
from pong.models import User

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_home_page(request):
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/home.html")
	return render(request, "sections/home.html")

def get_login_page(request):
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/login.html")
	return render(request, "sections/login.html")

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_game_page(request):
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/game.html")
	return render(request, "sections/game.html")

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url="/login")
def get_social_page(request):
	if not isinstance(request.user, User):
		return redirect("/logout")

	context = get_relationships_context(request.user)
	if request.headers.get('X-Custom-Header') != 'self':
		return render(request, "pages/social.html", context)
	return render(request, "sections/social.html", context)

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
