# Django imports
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator

# Project imports
from pong.models import User

def user_list(request):
    users = User.objects.all().values('display_name', 'is_online')
    return JsonResponse(list(users), safe=False)


def validate_name(name: str):
	"""
	Validates the given display name.

	Args:
		name (str): The display name to be validated.

	Raises:
		Exception: If the display name is not between 3 and 20 characters long,
				   contains spaces or special characters, or is already in use.

	Returns:
		None
	"""
	if len(name) >= 20 or len(name) < 3:
		raise Exception('Display name must be between 3 and 20 characters long')
	if any(not c.isalnum() for c in name):
		raise Exception('Display name cannot include spaces or special characters')
	if User.objects.filter(display_name=name).exists():
		raise Exception('Display name already in use')


@login_required(login_url="/login")
def update_display_name(request):
    if request.method != "POST":
        return JsonResponse({'error': 'Invalid request method'}, status=400)

    new_display_name = request.POST.get('name')
    try:
        if not new_display_name:
            raise ValueError("'name' is empty")

        user = request.user
        user.display_name = new_display_name
        user.save()

        return JsonResponse({'success': True, 'user': {'avatar': user.avatar.url, 'display_name': user.display_name}})
    
    except ValueError as ve:
        return JsonResponse({'success': False, 'message': str(ve)}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)
    

@login_required(login_url="/login")
def update_avatar(request):
    if request.method != "POST":
        return JsonResponse({'error': 'Invalid request method'}, status=400)

    uploaded_file = request.FILES.get('file')
    try:
        if not uploaded_file:
            raise ValidationError("'file' is empty")

        FileExtensionValidator(allowed_extensions=['svg', 'png', 'jpg', 'jpeg'])(uploaded_file)

        # Save the file
        user = request.user
        user.avatar.save(uploaded_file.name, uploaded_file)

        return JsonResponse({'success': True, 'user': {'avatar': user.avatar.url, 'display_name': user.display_name}})
    
    except ValidationError as ve:
        return JsonResponse({'success': False, 'message': str(ve)}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)
