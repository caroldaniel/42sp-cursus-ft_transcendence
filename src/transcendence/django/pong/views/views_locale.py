from django.conf import settings
from django.http import HttpResponseRedirect
from django.utils import translation
from django.urls import translate_url


def set_language(request):
    """
    Sets the language for the current user session.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        JsonResponse: A JSON response indicating the status of the language setting.
            - If the language is successfully set, the response will have a 'status' key with the value 'success'.
            - If the language is not valid or not provided, the response will have a 'status' key with the value 'fail'.
    """
    language = request.GET.get('language')
    next_url = request.GET.get('next', '/')
    if language and language in dict(settings.LANGUAGES).keys():
        translation.activate(language)
        response = HttpResponseRedirect(translate_url(next_url, language))
        response.set_cookie(settings.LANGUAGE_COOKIE_NAME, language)
        return response
    return HttpResponseRedirect(next_url)
