from django.contrib.auth.decorators import login_required
from django.core.validators import FileExtensionValidator
from django.http import HttpRequest, JsonResponse
from pong.models import User

def validate_name(name: str):
	if len(name) >= 20 or len(name) < 3:
		raise Exception('Display name must be between 3 and 20 characters long')
	if any(not c.isalnum() for c in name):
		raise Exception('Display name cannot include spaces or special characters')
	if User.objects.filter(display_name=name).exists():
		raise Exception('Display name already in use')

@login_required(login_url="/login")
def update_display_name(request: HttpRequest) -> JsonResponse:
	if request.method != "POST":
		return JsonResponse({'error': 'Invalid request method'}, status=400)

	new_display_name = request.POST.get('name')
	try:
		if new_display_name is None:
			raise Exception("'name' is empty")
		if not isinstance(request.user, User):
			raise Exception("Authentication failed to provide a valid user")
		validate_name(new_display_name)
		user = request.user
		old_display_name = user.display_name
		user.display_name = new_display_name
		user.save()
	except Exception as e:
		return JsonResponse({
			'success': False,
			'message': f'{e}'
		}, status=400)

	return JsonResponse({
		'success': True,
		'message': f'User {old_display_name} is now named {user.display_name}'
		})

@login_required(login_url="/login")
def update_avatar(request: HttpRequest) -> JsonResponse:
	if request.method != "POST":
		return JsonResponse({'error': 'Invalid request method'}, status=400)

	uploaded_file = request.FILES.get('file')
	try:
		if uploaded_file is None:
			raise Exception("'file' is empty")
		if not isinstance(request.user, User):
			raise Exception("Authentication failed to provide a valid user")
		FileExtensionValidator(allowed_extensions=['svg', 'png', 'jpg', 'jpeg'])(uploaded_file)
	except Exception as e:
		return JsonResponse({
			'success': False,
			'message': f'{e}'
		}, status=400)

	try:
		user = request.user
		user.avatar.save(uploaded_file.name, uploaded_file)
	except Exception as e:
		return JsonResponse({
			'success': False,
			'message': f'{e}'
		}, status=415)

	return JsonResponse({
		'success': True,
		'message': 'Avatar updated successfuly'
		})
