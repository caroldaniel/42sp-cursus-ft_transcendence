import os
import requests
from django.core.exceptions import BadRequest
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, JsonResponse
from django.shortcuts import redirect
from urllib.parse import urlencode, quote_plus
from pong.models import User

INTRA_AUTH_URL = "https://api.intra.42.fr/oauth/authorize?" + urlencode({
	'client_id': os.environ.get('FT_CLIENT_ID'),
	'redirect_uri': os.environ.get('FT_REDIRECT_URI'),
	'response_type': 'code'
	},
	quote_via=quote_plus)

@login_required(login_url="/login")
def manage_logout(request):
	if isinstance(request.user, User):
		request.user.is_online = False
		request.user.save()
	logout(request)
	return redirect('/login')

# On clicking "Login/Sign In", redirects to Intra OAuth2
def intra_login(request):
	return redirect(INTRA_AUTH_URL)

# After logging in on Intra, user is redirected here with a code
def intra_login_redirect(request: HttpRequest):
	intra_code = request.GET.get('code')
	print(f"Received code: {intra_code}")
	if intra_code is None:
		raise BadRequest('Failure to retrieved code from request')
	intra_user = get_intra_user_from_code(intra_code)

	try:
		authorized_user = authenticate(request=request,user=intra_user['login'])
		if authorized_user is None:
			raise Exception('User authentication error')
		login(request=request, user=authorized_user)
		return redirect('/')

	except Exception as e:
		print(f"Intra login authentication error: {e}")
	return JsonResponse({'error': 'Failure to authenticate'}, status=401)

# We use the code to obtain the user's public data
def get_intra_user_from_code(code: str):
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
		token_response = requests.post("https://api.intra.42.fr/oauth/token", data=data, headers=headers)
		access_token = token_response.json()['access_token']
		intra_user_response = requests.get("https://api.intra.42.fr/v2/me", headers={
			"Authorization": f"Bearer {access_token}"
		})
	except Exception as e:
		print(f"Intra user information exchange error: {e}")
	return intra_user_response.json()
