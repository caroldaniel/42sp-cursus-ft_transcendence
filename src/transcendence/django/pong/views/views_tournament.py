from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from django.http import JsonResponse
from pong.models import Tournament, Match, TournamentMatch, User, Guest
import json
import random

@csrf_exempt
@login_required
def create_tournament(request):
    if request.method == 'POST':
        user = request.user
        difficulty = request.POST.get('difficulty')
        players = []

        for i in range(1, 9):
            user_key = f'player{i}_user'
            guest_key = f'player{i}_guest'
            user_id = request.POST.get(user_key)
            guest_name = request.POST.get(guest_key)
            if user_id:
                user = User.objects.get(id=user_id)
                players.append((user, None))
            elif guest_name:
                guest, created = Guest.objects.get_or_create(display_name=guest_name)
                players.append((None, guest))
            else:
                break

        # Shuffle the players
        random.shuffle(players)

        nb_players = len(players)
        nb_matches = 3 if nb_players == 4 else 7

        # Create the Tournament
        tournament = Tournament(
            created_by=user,
            status="open",
            match_count=nb_matches
        )
        tournament.save()

        # Create initial matches
        initial_matches = nb_players // 2
        for i in range(initial_matches):
            player1, guest1 = players[2 * i]
            player2, guest2 = players[2 * i + 1]

            match = Match(
                difficulty=difficulty,
                tournament=tournament,
                player1_user=player1,
                player1_guest=guest1,
                player2_user=player2,
                player2_guest=guest2,
                score_player1=0,
                score_player2=0
            )
            match.save()

            tournament_match = TournamentMatch(
                tournament=tournament,
                match=match,
                position=i + 1,
                player1_display_name=player1.display_name if player1 else guest1.display_name,
                player2_display_name=player2.display_name if player2 else guest2.display_name
            )
            tournament_match.save()

        # Create subsequent matches without players
        for i in range(initial_matches, nb_matches):
            match = Match(
                difficulty=difficulty,
                tournament=tournament,
                score_player1=0,
                score_player2=0
            )
            match.save()

            tournament_match = TournamentMatch(
                tournament=tournament,
                match=match,
                position=i + 1,
                player1_display_name="TBD",
                player2_display_name="TBD"
            )
            tournament_match.save()

        return JsonResponse({'success': 'Tournament created', 'tournament_id': tournament.id}, status=200)
    return JsonResponse({'error': 'Invalid request'}, status=400)


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
        match_count = data.get('match_count')

        players_users = [User.objects.get(display_name=player) for player in players if User.objects.filter(display_name=player).exists()]
        players_users.append(user)

        tournament = Tournament.objects.create(created_by=user, match_count=match_count)
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
        tournament.current_match = f"{playerL} vs {playerR}"
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
        'current_match': tournament.current_match,
        } for tournament in tournaments]})
