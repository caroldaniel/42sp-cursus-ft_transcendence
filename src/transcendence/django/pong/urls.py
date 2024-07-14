from django.urls import path

from . import views

urlpatterns = [
    path("", views.get_home_page, name="home-page"),
    path('set-language/', views.set_language, name='set-language'),
    path("users/list/", views.user_list, name="user-list"),
    path("users/me/", views.get_current_user, name="user-me"),
    path("renew-game-token/", views.renew_token, name="renew-token"),
    path("users/<uuid:user_id>/", views.get_user, name="user-get"),
    path("login/", views.get_login_page, name="login-page"),
    path("register/user/", views.register, name="register-user"),
	path("login/oauth2/", views.intra_login, name="login-oauth2"),
	path("login/oauth2/redirect/", views.intra_login_redirect, name="login-oauth2-redirect"),
    path("login/manual/", views.manual_login, name="login-manual"),
    path("logout/", views.manage_logout, name="logout"),
    path("game/", views.get_game_page, name="game-page"),
    path("game/<uuid:user_id>/", views.get_user_game_page, name="user-game-page"),
    path("game/register/", views.register_match, name="register-match"),
    path("friend/send/", views.send_friend_request, name="send-friend-request"),
    path("friend/accept/", views.accept_friend_request, name="accept-friend-request"),
    path("friend/deny/", views.deny_friend_request, name="deny-friend-request"),
    path("friend/remove/", views.remove_friend, name="remove-friend"),
    path("chat/send_message/", views.send_message, name="send-message"),
    path("chat/get_messages/", views.get_messages, name="get-messages"),
    path("stats/", views.get_stats_page, name="stats-page"),
    path("stats/<uuid:user_id>/", views.get_user_stats_page, name="user-stats-page"),
    path("tournament/", views.get_tournament_page, name="tournament-page"),
    path("tournament/create/", views.get_tournament_form_page, name="tournament-form-page"),
    path("tournament/game/", views.get_tournament_game_page, name="tournament-game-page"),
    path("tournament/winner/", views.get_winner_page, name="tournament-winner-page"),
    path("profile/", views.get_profile_page, name="profile-page"),
    path("profile/edit/", views.edit_profile_field, name="profile-edit-page"),
    path("block/", views.block_user, name="block-user"),
    path("unblock/", views.unblock_user, name="unblock-user"),
	# # ! Uncomment this to populate database
    # path("populate_db/", views.populate_db, name="populate-db"),
]
