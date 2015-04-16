from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from .models import Danmaku
from django.views.generic import View


class DanmakuView(View):
    @staticmethod
    def get(request, token):
        danmaku_list = Danmaku.load_danmaku_by_video_token(token)
        return JsonResponse(danmaku_list, safe=False)

    @staticmethod
    def post(request, token):
        if request.user.is_anonymous():
            return HttpResponse('', status=401)
        try:
            data = request.POST
            assert isinstance(data, dict)
        except (ValueError, AssertionError):
            return HttpResponseBadRequest(
                {'errstr': 'invalid json format'},
                content_type='application/json'
            )

        assert 'mode' in data
        assert 'stime' in data
        assert 'text' in data
        assert 'color' in data
        assert 'size' in data
        assert 'date' in data
        Danmaku.new(
            owner=token,
            user=request.user,
            date=int(data['date']),
            mode=int(data['mode']),
            stime=int(data['stime']),
            text=data['text'],
            color=data['color'],
            size=int(data['size'])
        )
        return JsonResponse({'status': 'OK'})
