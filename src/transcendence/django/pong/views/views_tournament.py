from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import JsonResponse
from pong.models import Tournament, User
import json

@login_required
def tournament_create(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request'}, status=400)
    
    try:
        user = request.user
        check = Tournament.objects.filter(created_by=user)
        if check.exists():
            check.delete()
        
        data = json.loads(request.body)
        players = data.get('players', [])

        players_users = [User.objects.get(display_name=player) for player in players if User.objects.filter(display_name=player).exists()]
        players_users.append(user)

        tournament = Tournament.objects.create(created_by=user)
        tournament.registered_users.set(players_users)
        tournament.save()

        return JsonResponse({'tournament_id': tournament.id})
    except Exception as e:
        return JsonResponse({'error': 'Internal server error'}, status=500)

@login_required
def tournament_warning(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request'}, status=400)

    try:
        data = json.loads(request.body)
        playerL = data.get('playerL')
        playerR = data.get('playerR')
        currentMatch = data.get('currentMatch')

        tournament = Tournament.objects.get(created_by=request.user)
        if playerL == playerR:
            tournament.winner = playerL
            tournament.status = 'finished'
        tournament.match_count = currentMatch
        tournament.actual_match = f"{playerL} vs {playerR}"
        tournament.save()
        
        return JsonResponse({'success': 'Match updated'})
    except Tournament.DoesNotExist:
        return JsonResponse({'error': 'Tournament not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@login_required
def tournament_list(request):
    tournaments = Tournament.objects.filter(Q(registered_users=request.user) | 
                                            Q(created_by=request.user)).distinct()
    return JsonResponse({'tournaments': [{
        'id': tournament.id, 
        'created_by': tournament.created_by.display_name, 
        'created_at': tournament.created_at,
        'status': tournament.status,
        'winner': tournament.winner,
        'match_count': tournament.match_count, 
        'actual_match': tournament.actual_match,
        } for tournament in tournaments]})
