from django.urls import path

from . import views

urlpatterns = [
    path("", views.get_home_page, name="home-page"),
    path('set-language/', views.set_language, name='set_language'),
    path("users/list/", views.user_list, name="user-list"),
    path("login/", views.get_login_page, name="login-page"),
    path("register/user/", views.register, name="register-user"),
	path("login/oauth2/", views.intra_login, name="login-oauth2"),
	path("login/oauth2/redirect/", views.intra_login_redirect, name="login-oauth2-redirect"),
    path("login/manual/", views.manual_login, name="login-manual"),
    path("logout/", views.manage_logout, name="logout"),
    path("game/", views.get_game_page, name="game-page"),
    path("game/register/", views.register_match, name="register-match"),
    path("social/", views.get_social_page, name="social-page"),
    path("friend/send/", views.send_friend_request, name="send-friend-request"),
    path("friend/accept/", views.accept_friend_request, name="accept-friend-request"),
    path("friend/deny/", views.deny_friend_request, name="deny-friend-request"),
    path("friend/remove/", views.remove_friend, name="remove-friend"),
    path("stats/", views.get_stats_page, name="stats-page"),
    path("stats/<uuid:user_id>/", views.get_user_stats_page, name="stats-page"),
    path("tournament/", views.get_tournament_page, name="tournament-page"),
    path("tournament/create/", views.get_tournament_form_page, name="tournament-form-page"),
    path("tournament/game/", views.get_tournament_game_page, name="tournament-game-page"),
    path("tournament/winner/", views.get_winner_page, name="tournament-winner-page"),
    path("user/update_name/", views.update_display_name, name="update-display-name"),
    path("user/update_avatar/", views.update_avatar, name="update-avatar" ),
    path("profile/", views.get_profile_page, name="profile-page"),

	# # ! Uncomment this to populate database
    # path("populate_db/", views.populate_db, name="populate-db"),
]
