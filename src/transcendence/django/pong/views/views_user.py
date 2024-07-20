import uuid
import secrets

# Django imports
from django.conf import settings
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.utils.translation import gettext as _
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from .relationship.views_relationships import get_relationships_context
from pong.models import BlockList, Session
import json
# import redirect from django.shortcuts
from django.shortcuts import redirect

# Project imports
from pong.models import User

@login_required
def user_list(request):
    # Get all users and their online status
    # Get your own user out of the list
    users = User.objects.all().values('id', 'display_name', 'is_online', 'game_token')
    users = users.exclude(id=request.user.id)
    blockList = BlockList.objects.filter(blocker=request.user.id).values_list('blocked', flat=True)
    relationships = get_relationships_context(request.user)
    return JsonResponse({
        'users': list(users),
        'blockList': list(blockList),
        'relationships': relationships
    })

@login_required
def get_current_user(request):
    user = request.user
    avatar_url = f'{settings.MEDIA_URL}{str(user.avatar)}' if user.avatar else f'{settings.MEDIA_URL}default.svg'

    return JsonResponse({
        'avatar': avatar_url,
        'display_name': user.display_name,
    }, safe=False)

@login_required
def get_user(request, user_id):
    user = User.objects.get(id=user_id)
    avatar_url = f'{settings.MEDIA_URL}{str(user.avatar)}' if user.avatar else f'{settings.MEDIA_URL}default.svg'

    return JsonResponse({
        'avatar': avatar_url,
        'display_name': user.display_name,
        'game_token': user.game_token,
    }, safe=False)

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
 
@login_required
def block_user(request):
    if request.method != "POST":
        return JsonResponse({'error': 'Invalid request method'}, status=400)

    user1 = request.user
    user2 = request.POST.get('blocked')
    blocked = User.objects.get(id=user2)
    blocker = User.objects.get(id=user1.id)

    if not blocked:
        return JsonResponse({'error': _('User not found.')}, status=404)
    if blocked.id == blocker.id:
        return JsonResponse({'error': _('You cannot block yourself.')}, status=400)
    if(BlockList.objects.filter(blocked=blocked, blocker=blocker).exists()):
        return JsonResponse({'error': _('User already blocked.')}, status=400)
    else:
        block = BlockList(blocked=blocked, blocker=blocker)
        block.save()

    return JsonResponse({'success': _('User blocked successfully.')}, status=200)

@login_required
def unblock_user(request):
    if request.method != "POST":
        return JsonResponse({'error': 'Invalid request method'}, status=400)

    user2 = request.POST.get('blocked')
    user1 = request.user
    blocked = User.objects.get(id=user2)
    blocker = User.objects.get(id=user1.id)

    if not blocked:
        return JsonResponse({'error': _('User not found.')}, status=404)
    if(BlockList.objects.filter(blocked=blocked, blocker=blocker).exists()):
        BlockList.objects.filter(blocked=blocked, blocker=blocker).delete()
    else:
        return JsonResponse({'error': _('User not blocked.')}, status=400)

    return JsonResponse({'success': _('User unblocked successfully.')}, status=200)

@login_required
def renew_token(request):
    user = request.user
    token = secrets.token_urlsafe(4)[:5]
    user.game_token = token
    user.save()

    return JsonResponse({'success': _('Token renewed successfully.')}, status=200)

@login_required
def get_session(request):
    try:
        session = Session.objects.get(user=request.user)
        return JsonResponse(json.loads(session.data), status=200)
    except Session.DoesNotExist:
        return JsonResponse({'error': 'Session not found'}, status=404)

@login_required
def set_session(request):
    if request.method != "POST":
        return JsonResponse({'error': 'Invalid request method'}, status=400)

    try:
        body_data = json.loads(request.body.decode('utf-8'))
        
        data = body_data

        if data is None:
            return JsonResponse({'error': 'Session data is required'}, status=400)
        else:
            data = json.dumps(data)
            session, _ = Session.objects.get_or_create(user=request.user, defaults={'data': data})
            session.data = data
            session.save()

        return JsonResponse({'success': 'Session data updated successfully.'}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)