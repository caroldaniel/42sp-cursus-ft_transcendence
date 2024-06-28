from django.contrib.auth.backends import BaseBackend
from .models import User

class UserBackend(BaseBackend):
	def authenticate(self, request, username, email, first_name="", last_name="", is_intra_user=False) -> User | None:
		if not request.session.session_key:
			request.session.create()
		session_key = request.session.session_key

		try:
			auth_user = User.objects.get(username=username)
		except User.DoesNotExist:
			if not is_intra_user:
				return None
			# Create user if they don't exist
			auth_user = User.objects.create_user(
				username=username,
				email=email
			)
			# Fill in additional fields
			auth_user.first_name = first_name
			auth_user.last_name = last_name
			auth_user.is_intra_user = is_intra_user
		except Exception as e:
			print(f"User authentication error: {e}")
			return None

		# Update session key and online status
		auth_user.session_key = session_key
		auth_user.is_online = True
		auth_user.save()
		return auth_user

	def get_user(self, user_id) -> User | None:
		try:
			return User.objects.get(pk=user_id)
		except Exception as e:
			print(f"Auth get_user error{e}")
			return None
