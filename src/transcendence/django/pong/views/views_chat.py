from pong.models import Message, User
from django.http import HttpRequest, JsonResponse
from django.shortcuts import render
from django.db.models import Q

def send_message(request: HttpRequest):
    if request.method == 'POST':
        sender = request.user
        receiver_id = request.POST.get('receiver')
        content = request.POST.get('message')

        receiver = User.objects.get(pk=receiver_id)
        message = Message(sender=sender, receiver=receiver, content=content)
        message.save()
        return JsonResponse({'message': 'Message saved'})
    return JsonResponse({'error': 'Invalid request'}, status=400)

def get_messages(request: HttpRequest):
    if request.method == 'POST':
        user = request.user
        friend = request.POST.get('friend')

        messages = Message.objects.filter(Q(sender=user, receiver=friend) | Q(sender=friend, receiver=user)).order_by('timestamp')
        return JsonResponse({'messages': [{'sender': message.sender.display_name, 'content': message.content, 'timestamp': message.timestamp} for message in messages]})
    return JsonResponse({'error': 'Invalid request'}, status=400)