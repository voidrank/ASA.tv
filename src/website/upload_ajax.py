import os
import io
from PIL import Image
try:
    import simplejson as json
except Exception:
    import json

from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.views.generic import View
from video_cms.models import *
from django.contrib.auth.decorators import login_required

from video_cms.models import File
from video_cms.exceptions import *

from .exceptions import *
from .models import *

from .settings import AVATAR_ROOT, AVATAR_SIZE_LIMIT


class InitView(video_cms.upload_views.InitView):

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            if not ('collection' in data):
                raise ContentMismatch("Miss collection")
            if isinstance(data['collection'], str) is False:
                raise ContentMismatch("Collection must be a str, not a %s" % (type(data),))
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
                SessionEXT.objects.create(
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


init = InitView.as_view()


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


chunk = ChunkView.as_view()


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


finalize = FinalizeView.as_view()


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


destroy = DestroyView.as_view()


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


session = SessionsView.as_view()


# --------------------this part may be useless---------------------


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
