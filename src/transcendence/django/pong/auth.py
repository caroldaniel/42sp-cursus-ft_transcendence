from django.contrib.auth.backends import BaseBackend
from .models import User

class UserBackend(BaseBackend):
	"""
	Custom authentication backend for the User model.
	"""

	def authenticate(self, request, username, password=None) -> User | None:
		"""
		Authenticates a user based on the provided username and password, if any.

		Args:
			request (HttpRequest): The current request object.
			username (str): The username of the user to authenticate.
			password (str, optional): The password of the user. Defaults to None.

		Returns:
			User | None: The authenticated user if successful, None otherwise.
		"""
		if not request.session.session_key:
			request.session.create()
		session_key = request.session.session_key

		try:
			auth_user = User.objects.get(username=username)
		except Exception:
			return None
		
		# Check if authenticating with password
		if not auth_user.is_intra_user:
			if not password:
				return None
			if not auth_user.check_password(password):
				return None

		# Update session key and online status
		auth_user.session_key = session_key
		auth_user.is_online = True
		auth_user.save()
		return auth_user
	

	def get_user(self, user_id) -> User | None:
		"""
		Retrieves a user based on the provided user ID.

		Args:
			user_id: The ID of the user to retrieve.

		Returns:
			User | None: The user if found, None otherwise.
		"""
		try:
			return User.objects.get(pk=user_id)
		except Exception:
			return None
