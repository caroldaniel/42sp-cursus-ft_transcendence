import os
import requests

from urllib.parse import urlencode, quote_plus

# Django imports
from django.utils.translation import gettext as _
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.http import HttpRequest, JsonResponse
from django.core.exceptions import ValidationError

# Project imports
from pong.models import User


# Generate the Intra OAuth2 URL
INTRA_AUTH_URL = "https://api.intra.42.fr/oauth/authorize?" + urlencode({
	'client_id': os.environ.get('FT_CLIENT_ID'),
	'redirect_uri': os.environ.get('FT_REDIRECT_URI'),
	'response_type': 'code'
	},
	quote_via=quote_plus
)

# Get user information from the 42 API
def get_intra_user_from_code(code: str) -> dict:
	"""
	Retrieves the user information from the 42 API using the provided authorization code.

	Args:
		code (str): The authorization code obtained from the user after logging in.

	Returns:
		dict: A dictionary containing the user information retrieved from the 42 API.

	Raises:
		Exception: If there is an error during the exchange of information with the 42 API.
	"""
	data = {
		"grant_type": "authorization_code",
		"client_id": os.environ.get("FT_CLIENT_ID"),
		"client_secret": os.environ.get("FT_SECRET"),
		"code": code,
		"redirect_uri": os.environ.get("FT_REDIRECT_URI"),
	}
	headers = {
		"Content-Type": "application/x-www-form-urlencoded",
	}
	try:
		# Get access token
		token_response = requests.post("https://api.intra.42.fr/oauth/token", data=data, headers=headers)
		access_token = token_response.json()['access_token']

		# Get user information
		intra_user_response = requests.get("https://api.intra.42.fr/v2/me", headers={
			"Authorization": f"Bearer {access_token}"
		})
	except Exception as e:
		print(f"Intra user information exchange error: {e}")
		return None
	return intra_user_response.json()


# On clicking "Login/Sign In", redirects to Intra OAuth2
def intra_login(request):
	"""
	Redirects the user to the INTRA_AUTH_URL for authentication.

	Parameters:
	- request: The HTTP request object.

	Returns:
	- A redirect response to the INTRA_AUTH_URL.
	"""
	return redirect(INTRA_AUTH_URL)


# After logging in on Intra, user is redirected here with a code
def intra_login_redirect(request: HttpRequest):
	"""
	Redirects the user after successful login with Intra API.

	Args:
		request (HttpRequest): The HTTP request object.

	Returns:
		HttpResponse: The response object.

	Raises:
		BadRequest: If the code is not retrieved from the request.
		JsonResponse: If the user information cannot be retrieved.
	"""
	intra_code = request.GET.get('code')
	if intra_code is None:
		return JsonResponse({'error': _('Failure to retrieve code from request')}, status=400)	
	intra_user = get_intra_user_from_code(intra_code)
	if intra_user is None:
		return JsonResponse({'error': _('Failure to retrieve user information')}, status=401)

	# Get user's data from Intra API
	username = intra_user['login']
	email = intra_user['email']
	first_name = intra_user['first_name']
	last_name = intra_user['last_name']

	# Check if user is already in the database
	try:
		user = User.objects.get(username=username)
	except User.DoesNotExist:
		user = User.objects.create_user(
			username=username
		)
		user.email = email
		user.first_name = first_name
		user.last_name = last_name
		user.is_intra_user = True
		user.save()
	
	# Authenticate user
	authorized_user = authenticate(request, username=username)
	if authorized_user is None:
		return JsonResponse({'error': _('Failure to authenticate')}, status=401)
	
	login(request=request, user=authorized_user)
	return redirect('/')
	

# Register a new user
def register(request: HttpRequest):
	"""
	Register a new user.

	Args:
		request (HttpRequest): The HTTP request object.

	Returns:
		HttpResponse: A redirect response to the login page if the registration is successful,
					  or a JSON response with an error message and status code 400 if the request is invalid.
	"""
	if request.method == 'POST':
		# Process the registration form data
		username = request.POST.get('username')
		display_name = request.POST.get('display_name')
		first_name = request.POST.get('first_name')
		last_name = request.POST.get('last_name')
		email = request.POST.get('email')
		password = request.POST.get('password')

		# Error handling for input
		if User.objects.filter(username=username).exists():
			return JsonResponse({'error': _('Username already exists')}, status=400)

		if User.objects.filter(email=email).exists():
			return JsonResponse({'error': _('E-mail already registered')}, status=400)
		
		if User.objects.filter(display_name=display_name).exists():
			return JsonResponse({'error': _('Display name already taken')}, status=400)

		# Create a new user object
		try:
			user = User.objects.create_user(
				username=username
			)
			user.first_name = first_name
			user.display_name = display_name
			user.last_name = last_name
			user.email = email
			user.set_password(password)
			user.save()
		except ValidationError as e:
			return JsonResponse({'error': e.messages}, status=400)

		# Return a success response
		return JsonResponse({'success': _('User registered successfully')}, status=200)

	# Return an error response for invalid requests
	return JsonResponse({'error': _('Invalid request')}, status=400)


# Login from form
def manual_login(request: HttpRequest):
	"""
	View function for manual login.

	This view handles the manual login process. It expects a POST request with
	'username' and 'password' parameters. It checks if the provided username
	exists in the database and authenticates the user with the provided password.
	If the authentication is successful, the user is logged in and redirected to
	the home page. Otherwise, an appropriate error message is returned.

	Args:
		request (HttpRequest): The HTTP request object.

	Returns:
		JsonResponse: A JSON response containing the result of the login process.

	Raises:
		None.
	"""
	if request.method == 'POST':
		username = request.POST.get('username')
		password = request.POST.get('password')
		
		# Check if user exists in the database
		try:
			user = User.objects.get(username=username)
		except User.DoesNotExist:
			return JsonResponse({'error': _('No account found with the provided username. Please check username field or sign up to continue.')}, status=401)
		except Exception as e:
			return JsonResponse({'error': _('An error occurred while trying to log in. Please try again later.')}, status=500)

		if user.is_intra_user:
			return JsonResponse({'error': _('This account is registered with 42 Intra. Please use the Intra login button to log in.')}, status=401)

		user = authenticate(
			request, 
			username=username, 
			password=password
		)
		if user is not None:
			login(request, user)
			return JsonResponse({'success': True, 'redirect': '/'}, status=200)
		else:
			return JsonResponse({'error': _('Invalid login credentials. Please check your username and password and try again.')}, status=401)
	return JsonResponse({'error': 'Invalid request'}, status=400)

# Logout the user
@login_required(login_url="/login")
def manage_logout(request):
	"""
	Logs out the user and updates their online status.

	Args:
		request (HttpRequest): The HTTP request object.

	Returns:
		HttpResponseRedirect: A redirect response to the login page.

	"""
	if isinstance(request.user, User):
		request.user.is_online = False
		request.user.save()
	logout(request)

	return redirect('/login')