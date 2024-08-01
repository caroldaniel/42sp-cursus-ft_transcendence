from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import gettext as _
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
            if match.status == 'pending':
                match.status = 'wo'
                match.walkover = True
                match.save()
            return JsonResponse({'success': 'Match result updated'}, status=200)
        except Match.DoesNotExist:
            return JsonResponse({'error': 'Match not found'}, status=404)
    return JsonResponse({'error': 'Invalid request'}, status=400)


def update_match_result(request, match_id):
    if request.method == 'POST':
        try:
            match = Match.objects.get(pk=match_id)
            match.status = 'finished'
            match.score_player1 = request.POST.get('score_player1')
            match.score_player2 = request.POST.get('score_player2')
            match.save()
            return JsonResponse({'success': 'Match result updated'}, status=200)
        except:
            return JsonResponse({'error': 'Match not found'}, status=404)
    return JsonResponse({'error': 'Invalid request'}, status=400)


def get_match_status(request, match_id):
    # return status of the match and the winner's display name
    if request.method == 'GET':
        try:
            match = Match.objects.get(pk=match_id)
            if match.status == 'finished':
                if match.score_player1 > match.score_player2:
                    winner = match.player1_user.display_name if match.player1_user else match.player1_guest.display_name
                else:
                    winner = match.player2_user.display_name if match.player2_user else match.player2_guest.display_name
                return JsonResponse({'status': _('{} has won').format(winner)}, status=200)
            if match.status == 'wo':
                return JsonResponse({'status': _('Game has been forfeited')}, status=200)
            else:
                return JsonResponse({'status': None}, status=200)
        except Match.DoesNotExist:
            return JsonResponse({'error': 'Match not found'}, status=404)
    return JsonResponse({'error': 'Invalid request'}, status=400)