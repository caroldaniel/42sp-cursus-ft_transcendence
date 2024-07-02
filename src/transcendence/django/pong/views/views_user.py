import uuid
# Django imports
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.utils.translation import gettext as _
from django.contrib.auth.decorators import login_required


# Project imports
from pong.models import User

def user_list(request):
    users = User.objects.all().values('id', 'display_name', 'is_online')
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


@login_required
def edit_profile_field(request):
    if request.method != "POST":
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    
    field = request.POST.get('field')
    user = request.user

    # Handle different fields
    if field == 'avatar':
        avatar_file = request.FILES.get('new_value')
        try:
            if not avatar_file:
                raise ValidationError("'file' is empty")

            FileExtensionValidator(allowed_extensions=['svg', 'png', 'jpg', 'jpeg'])(avatar_file)

            # Save the file with a name based on a id
            random_id = uuid.uuid4()
            new_name = f'{random_id}.{avatar_file.name.split(".")[-1]}'
            user.avatar.save(new_name, avatar_file)

            return JsonResponse({'success': _('Avatar updated successfully.')}, status=200)
            
        except ValidationError as ve:
            return JsonResponse({'error': _('Avatar format not valid.')}, status=400)
        except Exception as e:
            return JsonResponse({'error': _('An error occurred while trying to upload the avatar. Try again later.')}, status=500)
    else:
        new_value = request.POST.get('new_value')
        # Handle other fields (username, first_name, last_name, email, password)
        try:
            if not field:
                raise ValueError("'field' is empty")
            if field == 'display_name':
                user.display_name = new_value
            elif field == 'first_name':
                user.first_name = new_value
            elif field == 'last_name':
                user.last_name = new_value
            elif field == 'email':
                user.email = new_value
            elif field == 'password':
                user.set_password(new_value)
            user.save()

            return JsonResponse({'success': _('Field updated successfully.')}, status=200)
        
        except ValidationError as ve:
            return JsonResponse({'error': _('New value is not in a valid format.')}, status=400)
        except Exception as e:
            return JsonResponse({'error': _('An error occurred while trying to update field. Try again later.')}, status=500)