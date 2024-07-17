from django.shortcuts import redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from pong.models import Tournament, User
import json
import logging

logger = logging.getLogger(__name__)

@login_required
def tournament_create(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request'}, status=400)
    
    try:
        user = request.user
        data = json.loads(request.body)
        players = data.get('players', [])

        # Filter and validate the players
        valid_players = [User.objects.get(display_name=player) for player in players if User.objects.filter(display_name=player).exists()]
        valid_players.append(user)

        tournament = Tournament.objects.create(created_by=user)
        tournament.registered_users.set(valid_players)  # Assuming registered_users is a ManyToManyField
        tournament.save()
        
        return JsonResponse({'tournament_id': tournament.id})
    except Exception as e:
        logger.error(f"Error creating tournament: {e}")
        return JsonResponse({'error': 'Internal server error'}, status=500)

@login_required
def tournament_warning(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request'}, status=400)
    
    try:
        user = request.user
        data = json.loads(request.body)
        tournament_id = data.get('tournament_id')
        playerL = data.get('playerL')
        playerR = data.get('playerR')
        currentMatch = data.get('currentMatch')

        tournament = Tournament.objects.get(id=tournament_id)
        if tournament.created_by != user:
            return JsonResponse({'error': 'You are not the creator of this tournament'}, status=403)
        
        tournament.match_count = currentMatch
        tournament.actual_match = f"{playerL} vs {playerR}"
        tournament.save()
        
        return JsonResponse({'success': 'Match updated'})
    except Tournament.DoesNotExist:
        return JsonResponse({'error': 'Tournament not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
