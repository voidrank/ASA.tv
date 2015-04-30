from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from django.views.generic import View
from django.conf import settings

from .models import Danmaku


class DanmakuView(View):
    @staticmethod
    def get(request, token):
        danmaku_list = Danmaku.load_danmaku_by_video_token(token)
        return JsonResponse(danmaku_list, safe=False)

    @staticmethod
    def post(request, token):
        if request.user.is_anonymous() and getattr(settings, 'ASA_WITH_DANMAKU_AUTH', False):
            return HttpResponse('', status=401)
        try:
            data = request.POST
            assert isinstance(data, dict)
        except (ValueError, AssertionError):
            return HttpResponseBadRequest(
                {'errstr': 'invalid json format'},
                content_type='application/json'
            )

        if getattr(settings, 'ASA_WITH_DANMAKU_AUTH', False) is True:
            user = request.user
        else:
            user = None

        Danmaku.new(
            user=user,
            owner=token,
            date=int(data['date']),
            mode=int(data['mode']),
            stime=int(data['stime']),
            text=data['text'],
            color=data['color'],
            size=int(data['size'])
        )

        return JsonResponse({'status': 'OK'})


danmaku = DanmakuView.as_view()
