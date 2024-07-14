from pong.models import User
from .queries_relationship import *

def get_relationships_context(user):
    friends = get_friends_list(user)
    friends.sort(key=lambda usr: usr.display_name.lower())

    sent_requests = [
        User.objects.get(pk=user_id) for user_id in list(get_sent_requests_qlist(user))
    ]

    received_requests = [
        User.objects.get(pk=user_id) for user_id in list(get_received_requests_qlist(user))
    ]

    context = {
        'friendList': [friend.id for friend in friends],
        'sentList': [request.id for request in sent_requests],
        'receivedList': [request.id for request in received_requests]
    }
    return context
