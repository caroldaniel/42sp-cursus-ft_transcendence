from django.shortcuts import redirect
from django.utils import translation
from django.conf import settings

def set_language(request):
    language = request.GET.get('language')
    if language and language in dict(settings.LANGUAGES).keys():
        translation.activate(language)
        response = redirect('/')
        response.set_cookie(settings.LANGUAGE_COOKIE_NAME, language)
        return response
    return redirect('/')
