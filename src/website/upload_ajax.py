import os
import io
from PIL import Image
try:
    import simplejson as json
except Exception:
    import json

from django.conf.urls import patterns, url
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.views.generic import View
from video_cms.models import *
from django.contrib.auth.decorators import login_required

from video_cms.models import File
from video_cms.exceptions import *

from .exceptions import *
from .models import *
from .settings import (VIDEO_COVER_DIR,
                       AVATAR_ROOT, AVATAR_SIZE_LIMIT)


class InitView(video_cms.upload_views.InitView):

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            if not ('collection' in data):
                raise ContentMismatch("Miss collection")
            if isinstance(data['collection'], list) is False:
                raise ContentMismatch("Collection must be a list, not a %s" % (type(data),))
            if Collection.objects.filter(name=data['collection']).exists() is False:
                raise NoSuchCollection("Collection '%s' not found" % (data['collection'],))
            if Collection.objects.get(name=data['collection']).abstract is True:
                raise CollectionIsAbstract(data['collection'])
            response = super(InitView, self).post(
                request,
                *args,
                **kwargs
            )
            if response.status_code == 201:
                res_data = json.loads(response.content)
                session = Session.objects.get(token=res_data['token'])
                col = Collection.objects.get(name=data['collection'])
                SessionExt.objects.create(
                    session=session,
                    uploader=request.user,
                    collection=col
                )
            return response
        except Exception as e:
            return JsonResponse(
                {'status': 'error', 'msg': str(e)},
                status=400,
            )

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super(InitView, self).dispatch(request, *args, **kwargs)


def auth_check(user, owner):
    owner = Session.objects.get(token=owner)
    if owner.ext.uploader != user:
        raise Unauthorized("You are not the uploader")


class ChunkView(video_cms.upload_views.ChunkView):

    def put(self, request, owner, *args, **kwargs):
        try:
            auth_check(request.user, owner)
            response = super(ChunkView, self).put(
                request,
                owner,
                *args,
                **kwargs
            )
        except Exception as e:
            return HttpResponse(json.dumps({
                'errstr': str(e)
            }))
        return response

    def get(self, request, owner, *args, **kwargs):
        try:
            auth_check(request.user, owner)
            response = super(ChunkView, self).get(
                request,
                owner,
                *args,
                **kwargs
            )
        except Exception as e:
            return HttpResponse(json.dumps({
                'errstr': str(e)
            }))
        return response

    @method_decorator(login_required)
    def dispatch(self, request, owner, *args, **kwargs):
        return super(ChunkView, self).dispatch(request, owner, *args, **kwargs)


class FinalizeView(video_cms.upload_views.FinalizeView):
    def get(self, request, owner, *args, **kwargs):
        session = Session.objects.get(token=owner)
        try:
            auth_check(request.user, owner)
            col = session.ext.collection
            session.ext.delete()
            response = super(FinalizeView, self).get(
                request,
                owner,
                *args,
                **kwargs
            )
            if response.status_code != 201:
                return response
            data = json.loads(response.content)
            base = File.objects.get(token=data['token'])
            FileEXT.objects.create(
                base=base,
                collection=col,
                uploader=request.user
            )
            return response
        except Exception as e:
            raise e
            return HttpResponse(json.dumps({
                'errstr': str(e)
            }))

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(FinalizeView, self).dispatch(*args, **kwargs)


class DestroyView(video_cms.upload_views.DestroyView):

    def get(self, request, owner, *args, **kwargs):
        owner = owner.lower()
        try:
            auth_check(request.user, owner)
            return super(DestroyView, self).get(request, owner, *args, **kwargs)
        except Exception as e:
            raise e
            return HttpResponse(json.dumps({
                'errstr': str(e)
            }))

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(DestroyView, self).dispatch(*args, **kwargs)


class SessionsView(View):

    def get(self, request, *args, **kwargs):
        user = request.user
        return HttpResponse(json.dumps(list(
            map(
                lambda record: {
                    'hash': record.session.filehash,
                    'filename': record.session.filename,
                    'size': record.session.size,
                    'token': record.session.token,
                    'chunksize': record.session.chunk_size
                },
                user.sessionext_set.order_by('id')
            )
        )))

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(SessionsView, self).dispatch(*args, **kwargs)


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


class VideoCoverView(View):

    def get(self, request, rec, *args, **kwargs):
        try:
            f = open(os.path.join(VIDEO_COVER_DIR, rec), "rb")
        except Exception:
            f = open(os.path.join(VIDEO_COVER_DIR, 'default'), "rb")
        return HttpResponse(f.read(), content_type='image')

    def post(self, request, rec, *args, **kwargs):
        try:
            video = File.objects.get(rec=int(rec))
        except Exception:
            return HttpResponse(json.dumps({
                'status': 'error',
                'reason': 'video file does not exists'
            }))
        if video.ext.uploader == request.user:
            with open(os.path.join(VIDEO_COVER_DIR, rec), "wb") as f:
                f.write(request.body)
            return HttpResponse(json.dumps({
                'status': 'OK'
            }))
        else:
            return HttpResponse(json.dumps({
                'status': 'error',
                'reason': 'Permission Denied: you are not the uploader'
            }))

    def dispatch(self, *args, **kwargs):
        return super(VideoCoverView, self).dispatch(*args, **kwargs)


@login_required
def GenericPerInfo(request):
    return HttpResponse(json.dumps({
        'username': request.user.username,
        'email': request.user.email,
    }))


@login_required
def AdvacedPerInfo(request):
    info = AdvancedPerInfo.objects.get(user=request.user)
    return HttpResponse(json.dumps({
        'chunksize': info.default_chunksize,
    }))


@login_required
def myupload(request):
    assert 'op' in request.GET
    assert 'ct' in request.GET
    op = int(request.GET['op'])
    ct = int(request.GET['ct'])
    if ct > 20:
        ct = 20
    return HttpResponse(json.dumps(list(map(
        lambda video: {
            'rec': video.base.rec,
            'filename': video.base.filename,
            'click_counts': 0
        },
        FileEXT.objects.filter(uploader=request.user).order_by('base__rec')[op: op + ct]
    ))))


@login_required
def mygroup(request):
    return HttpResponse(json.dumps(
        list(map(
            lambda group: group.name,
            request.user.groups.all()
        ))
    ))


def video_list(request):
    assert 'col' in request.GET
    try:
        col = Collection.objects.get(name=request.GET['col'])
    except Exception:
        raise CollectionNotFound(request.GET['col'])
    return JsonResponse(
        list(map(
            lambda video: {
                'rec': video.base.rec,
                'filename': video.base.filename
            },
            col.file_set.all()
        )),
        status=201,
        safe=False
    )


class AvatarView(View):

    def get(self, request):
        try:
            with open(os.path.join(AVATAR_ROOT, request.user.username + '.png'), "rb") as f:
                return HttpResponse(f.read(), content_type='image/png')
        except Exception as e:
            raise e
            return HttpResponse(json.dumps({'status': 'error', 'reason': 'file not found'}))

    def patch(self, request):
        assert 'x1' in request.GET
        x1 = int(request.GET['x1'])
        assert 'y1' in request.GET
        y1 = int(request.GET['y1'])
        assert 'x2' in request.GET
        x2 = int(request.GET['x2'])
        assert 'y2' in request.GET
        y2 = int(request.GET['y2'])
        img = io.BytesIO(request.body)
        if img.seek(0, 2) > AVATAR_SIZE_LIMIT:
            return HttpResponse(
                {
                    "status": "error",
                    "reason": "Image size exceeds %d b" % (AVATAR_SIZE_LIMIT,)
                }
            )
        img.seek(0, 0)
        img = Image.open(img)
        img = img.crop((x1, y1, x2, y2))
        img.save(os.path.join(AVATAR_ROOT, request.user.username + '.png'))
        return HttpResponse({"status": "OK"})

    def post(self, request):
        with open(os.path.join(AVATAR_ROOT, request.user.username), "wb") as f:
            f.write(request.body)
        return HttpResponse(json.dumps({'status': 'OK'}))

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(AvatarView, self).dispatch(*args, **kwargs)


urlpatterns_upload = patterns(
    r'',
    url(
        r'^upload/init/?',
        InitView.as_view(),
        name='init'
    ),

    url(
        r'^upload/chunk/(?P<owner>[a-fA-F0-9]{64})/?',
        ChunkView.as_view(),
        name='chunk'
    ),

    url(
        r'^upload/store/(?P<owner>[a-fA-F0-9]{64})/?',
        FinalizeView.as_view(),
        name='store'
    ),

    url(
        r'^upload/destroy/(?P<owner>[a-fA-F0-9]{64}/?)',
        DestroyView.as_view(),
        name='destroy'
    ),

    url(
        r'^upload/session/$',
        SessionsView.as_view(),
        name='sessions'
    )
)
