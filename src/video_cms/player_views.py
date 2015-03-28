from django.http import HttpResponseBadRequest, \
    HttpResponse
from django.shortcuts import render_to_response
from django.views.generic import View
from .models import *
from .exceptions import *

try:
    import simplejson as json
except Exception:
    import json

import logging
logger = logging.getLogger(__name__)


class MediaView(View):
    @staticmethod
    def get(request, filename, *args, **kwargs):
        assert filename is not None
        try:
            rec = int(filename)
            token = File.get_token_by_rec(rec)
        except:
            token = File.get_token_by_name(filename)
        return render_to_response(
            "media.html",
            {"token": token}
        )


class DownloadView(View):
    @staticmethod
    def get(request, token, *args, **kwargs):
        try:
            assert 'HTTP_RANGE' in request.META
        except Exception as e:
            return HttpResponseBadRequest(json.dumps({
                'errstr': 'missing required field'
            }))
        try:
            stream_op = int(request.META['HTTP_RANGE'].split("-")[0][6:])
        except Exception as e:
            return HttpResponseBadRequest(json.dumps({
                'errstr': 'wrong Range format'
            }))
        try:
            stream_ed, content, size = File.get_chunk_by_token(token, stream_op)
        except Exception as e:
            return HttpResponse(
                json.dumps({'errstr': str(e)}),
                status_code=e.status_code
            )
        response = HttpResponse(content, content_type='video/mp4')
        response.status_code = 206
        print(response.status_code)
        response['Accept-Ranges'] = 'bytes'
        response['Content-Length'] = stream_ed - stream_op + 1
        response['Content-Range'] = 'bytes %s-%s/%s' % \
            (stream_op, size - 1, size)
        return response


class DanmakuView(View):
    @staticmethod
    def get(request, token):
        danmaku_list = Danmaku.load_danmaku_by_video_token(token)
        return HttpResponse(json.dumps(danmaku_list))

    @staticmethod
    def post(request, token):
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
            date=int(data['date']),
            mode=int(data['mode']),
            stime=int(data['stime']),
            text=data['text'],
            color=data['color'],
            size=int(data['size'])
        )
        return HttpResponse(json.dumps({'status': 'OK'}))
