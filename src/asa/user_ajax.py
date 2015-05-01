from django.http import HttpResponse, JsonResponse


def UserLogIO(request):
    if request.user.is_authenticated():
        return JsonResponse({
            'username': request.user.username,
        })
    else:
        return HttpResponse('plz login in', status=401)
