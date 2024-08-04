from django.http import JsonResponse, HttpRequest
from django.db.models import Q
from django.utils import timezone

from django.contrib.auth.decorators import login_required

from pong.models import Message, User, BlockList


@login_required
def send_message(request: HttpRequest):
    """
    Sends a message from the current user to the specified receiver.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        JsonResponse: A JSON response indicating the success or failure of the message sending.
    """
    if request.method == 'POST':
        sender = request.user
        receiver_id = request.POST.get('messageReceiver')
        content = request.POST.get('messageText')

        # Check if the receiver exists
        receiver = User.objects.get(pk=receiver_id)

        # Create the message object
        message = Message(sender=sender, receiver=receiver, content=content)

        # Check if the sender is blocked by the receiver
        if BlockList.objects.filter(blocker=receiver, blocked=sender).exists():
            message.sent_when_blocked = True
        
        # Save the message
        message.save()
        return JsonResponse({'success': 'Message saved'}, status=200)
    return JsonResponse({'error': 'Invalid request'}, status=400)


@login_required
def get_messages(request: HttpRequest):
    """
    Retrieve and return the messages between the user and a friend.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        JsonResponse: A JSON response containing the unread message count and the messages between the user and the friend.

    Raises:
        User.DoesNotExist: If the friend does not exist.
    """

    if request.method == 'POST':
        user = request.user
        friend_id = request.POST.get('friend')

        if not friend_id:
            return JsonResponse({'error': 'Friend ID not provided'}, status=400)

        try:
            friend = User.objects.get(pk=friend_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Friend does not exist'}, status=404)

        messages = Message.objects.filter(Q(sender=user, receiver=friend) | Q(sender=friend, receiver=user)).exclude(sent_when_blocked=True).order_by('timestamp')

        for message in messages:
            if message.receiver == user:
                # Mark the last_read field as the current time if the message is from the friend
                message.last_read = timezone.now()

                message.save()

        unread_messages = Message.objects.filter(receiver=friend, last_read=None).count()

        return JsonResponse({
            'unread_messages': unread_messages,
            'messages': [{
                'sender': message.sender.display_name,
                'sender_id': message.sender.id,
                'content': message.content, 
                'timestamp': message.timestamp,
                'last_read': message.last_read
            } for message in messages]
        })
    return JsonResponse({'error': 'Invalid request'}, status=400)


@login_required
def get_unread_messages(request: HttpRequest):
    """
    Retrieve and return the unread messages between the user and all its friends.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        JsonResponse: A JSON response containing all the unread messages between the user and its friends.

    Raises:
        User.DoesNotExist: If the friend does not exist.
    """

    if request.method == 'POST':
        user = request.user

        # Get all unread messages
        unread_messages = Message.objects.filter(receiver=user, last_read=None).exclude(sent_when_blocked=True)

        # Get the unique senders of the unread messages
        senders = unread_messages.values('sender').distinct()

        # Get the count of unread messages from each sender
        unread_counts = []
        for sender in senders:
            sender_id = sender['sender']
            sender = User.objects.get(pk=sender_id)
            unread_count = unread_messages.filter(sender=sender).count()
            unread_counts.append({
                'sender_id': sender.id,
                'unread_count': unread_count
            })
        
        return JsonResponse({
            'unread_messages': unread_messages.count(),
            'unread_counts': unread_counts
        }, status=200)
    return JsonResponse({'error': 'Invalid request'}, status=400)

