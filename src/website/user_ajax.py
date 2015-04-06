from django.conf.urls import patterns, url
from django.http import HttpResponse, JsonResponse


def UserLogIO(request):
    if request.user.is_authenticated():
        return JsonResponse({
            'username': request.user.username,
        })
    else:
        return HttpResponse('plz login in', status=401)


urlpatterns_user = patterns(
    '',
    url('user_log_io', UserLogIO)
)
