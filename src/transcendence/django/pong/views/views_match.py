# views.py
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pong.models import Match, User, Guest
import json


@csrf_exempt
def validate_game_token(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            player_id = data.get('player_id')
            game_token = data.get('game_token')

            try:
                player = User.objects.get(id=player_id)
                if player.game_token == game_token:
                    return JsonResponse({'valid': True})
            except User.DoesNotExist:
                pass
        except json.JSONDecodeError:
            return JsonResponse({'valid': False, 'error': 'Invalid JSON'})

    return JsonResponse({'valid': False, 'player_id': player_id, 'game_token': game_token})


@csrf_exempt
def create_match(request):
    if request.method == 'POST':
        difficulty = request.POST.get('difficulty')
        player1_user_id = request.POST.get('player1_user')
        player1_guest_name = request.POST.get('player1_guest')
        player2_user_id = request.POST.get('player2_user')
        player2_guest_name = request.POST.get('player2_guest')

        # Handle Player 1
        if player1_guest_name:
            player1_guest, created = Guest.objects.get_or_create(display_name=player1_guest_name)
            player1_user = None
        else:
            player1_user = User.objects.get(id=player1_user_id)
            player1_guest = None
        
        # Handle Player 2
        if player2_guest_name:
            player2_guest, created = Guest.objects.get_or_create(display_name=player2_guest_name)
            player2_user = None
        else:
            player2_user = User.objects.get(id=player2_user_id)
            player2_guest = None

        # Create the Match
        match = Match(
            player1_user=player1_user,
            player1_guest=player1_guest,
            player2_user=player2_user,
            player2_guest=player2_guest,
            difficulty=difficulty,
            score_player1=0,
            score_player2=0
        )
        match.save()
        return JsonResponse({'success': 'Match created', 'match_id': match.id}, status=200)
    return JsonResponse({'error': 'Invalid request'}, status=400)


@csrf_exempt
def update_result_wo(request, match_id):
    if request.method == 'POST':
        try:
            match = Match.objects.get(pk=match_id)
            match.status = 'wo'
            match.walkover = True
            match.save()
            return JsonResponse({'success': 'Match result updated to WO'}, status=200)
        except Match.DoesNotExist:
            return JsonResponse({'error': 'Match not found'}, status=404)
    return JsonResponse({'error': 'Invalid request'}, status=400)


def update_match_result(request, match_id):
    match = get_object_or_404(Match, id=match_id)
    if request.method == 'POST':
        match.score_player1 = request.POST.get('score_player1')
        match.score_player2 = request.POST.get('score_player2')
        match.status = 'completed'
        match.save()
        return JsonResponse({'success': 'Match updated'}, status=200)
    return JsonResponse({'error': 'Invalid request'}, status=400)

def set_match_walkover(request, match_id):
    match = get_object_or_404(Match, id=match_id)
    match.status = 'wo'
    match.walkover = True
    match.save()
    return JsonResponse({'status': 'success'})