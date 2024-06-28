import os
import requests

from urllib.parse import urlencode, quote_plus

# Django imports
from django.core.exceptions import BadRequest
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, JsonResponse
from django.shortcuts import redirect

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
		raise BadRequest('Failure to retrieve code from request')
	
	intra_user = get_intra_user_from_code(intra_code)
	if intra_user is None:
		raise JsonResponse({'error': 'Failure to retrieve user information'}, status=401)

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
		raise JsonResponse({'error': 'Failure to authenticate'}, status=401)
	
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
		first_name = request.POST.get('first_name')
		last_name = request.POST.get('last_name')
		email = request.POST.get('email')
		password = request.POST.get('password')

		# Create a new user object
		user = User.objects.create_user(
			username=username
		)
		if user is None:
			raise JsonResponse({'error': 'User already exists'}, status=400)

		user.first_name = first_name
		user.last_name = last_name
		user.email = email
		user.set_password(password)
		user.save()

		# Redirect to the login page
		return redirect('/login')

	# Return an error response for invalid requests
	return JsonResponse({'error': 'Invalid request'}, status=400)


# Login from form
def manual_login(request: HttpRequest):
	if request.method == 'POST':
		username = request.POST.get('username')
		password = request.POST.get('password')
		user = authenticate(
			request, 
			username=username, 
			password=password
		)
		if user is not None:
			login(request, user)
			return redirect('/')
		else:
			return JsonResponse({'error': 'Invalid credentials'}, status=401)
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