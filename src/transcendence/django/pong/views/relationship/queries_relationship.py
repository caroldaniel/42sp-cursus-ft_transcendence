from django.db.models import Q
from pong.models import Relationship, User

def get_friends_list(user: User) -> list[User]:
	friends1 = Relationship.objects.filter(user1=user,
		user1_is_friendly=True,
		user2_is_friendly=True
		).values_list('user2', flat=True)
	friends2 = Relationship.objects.filter(user2=user,
		user1_is_friendly=True,
		user2_is_friendly=True
		).values_list('user1', flat=True)

	friends = [
		User.objects.get(pk=friend_id) for friend_id in list(friends1) + list(friends2)
		]
	return friends

def get_not_friends_qlist(user: User):
	if not Relationship.objects.filter(Q(user1=user) | Q(user2=user)).exists():
		return User.objects.exclude(pk=user.pk)

	related_user_ids = Relationship.objects.filter(
		Q(user1=user) | Q(user2=user),
		user1_is_friendly=True,
		user2_is_friendly=True
	).values_list('user1_id', 'user2_id')

	unique_related_user_ids = set()
	for id_tuple in related_user_ids:
		unique_related_user_ids.add(id_tuple[0])
		unique_related_user_ids.add(id_tuple[1])

	not_friends = User.objects.exclude(
		pk__in=list(unique_related_user_ids)
	).order_by("display_name").values("id", "display_name", "avatar", "last_login")

	return not_friends

def get_sent_requests_qlist(user: User):
	return Relationship.objects.filter(
		user1=user,
		user1_is_friendly=True,
		user2_is_friendly=False
		).values_list('user2', flat=True)

def get_received_requests_qlist(user: User):
	return Relationship.objects.filter(
		user2=user,
		user1_is_friendly=True,
		user2_is_friendly=False
		).values_list('user1', flat=True)
