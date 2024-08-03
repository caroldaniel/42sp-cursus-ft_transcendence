from django.conf import settings
from django.http import HttpResponseRedirect
from django.utils import translation
from django.urls import translate_url


def set_language(request):
    language = request.GET.get('language')
    next_url = '/'
    if language and language in dict(settings.LANGUAGES).keys():
        translation.activate(language)
        response = HttpResponseRedirect(translate_url(next_url, language))
        response.set_cookie(settings.LANGUAGE_COOKIE_NAME, language)
        return response
    return HttpResponseRedirect(next_url)
