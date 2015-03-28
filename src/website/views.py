try:
    import simplejson as json
except Exception:
    import json
from .models import *

from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import View
from django.contrib.auth.models import User, UserManager
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from video_cms.settings import MIN_CHUNK_SIZE
import video_cms


def indexpage(request):
    return render(request, 'index.html')


class register(View):

    def get(self, request, *args, **kwargs):
        return render(request, 'register.html')

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        assert 'username' in data
        assert 'password' in data
        assert 'email' in data
        try:
            User.objects.get(username=data['username'])
        except User.DoesNotExist:
            pass
        else:
            return HttpResponse(json.dumps({"status": "error", "msg": "duplicated"}))
        UserManager.create_user(
            username=data['username'],
            email=data['email'],
            password=['password']
        )
        AdvancedPerInfo.objects.create(
            user=user,
            default_chunksize=MIN_CHUNK_SIZE,
            default_path=['home', user.username]
        )
        return HttpResponse(json.dumps({"status": "OK"}))

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_active:
            return render(request, "logged_in_register.html")
        else:
            return super(register, self).dispatch(request, *args, **kwargs)


@login_required
def homepage(request):
    return render(request, 'homepage.html')


class PageView(video_cms.upload_views.PageView):
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(PageView, self).dispatch(*args, **kwargs)
