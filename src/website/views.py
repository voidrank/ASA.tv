try:
    import simplejson as json
except Exception:
    import json
from .models import *

from django.shortcuts import render, render_to_response
from django.http import HttpResponse
from django.views.generic import View
from django.contrib.auth.models import User, UserManager
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from video_cms.settings import MIN_CHUNK_SIZE
from video_cms.models import *


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


class MediaView(View):
    @staticmethod
    def get(request, rec, *args, **kwargs):
        assert rec is not None
        try:
            rec = int(rec)
            token = File.get_token_by_rec(rec)
        except:
            token = File.get_token_by_name(rec)
        return render_to_response(
            "media.html",
            {"token": token}
        )
