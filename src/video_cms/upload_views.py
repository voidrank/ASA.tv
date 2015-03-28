from django.http import HttpResponseBadRequest, \
    HttpResponseForbidden, HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.views.generic import View
from django.utils.decorators import method_decorator
from .models import Session, Chunk
from .exceptions import UploadException
from django.views.decorators.csrf import csrf_exempt
try:
    import simplejson as json
except Exception:
    import json

# Create your views here.


class InitView(View):
    def post(self, request, data, *args, **kwargs):
        try:
            assert 'size' in data
            assert 'hash' in data
            assert 'filename' in data
            assert 'chunksize' in data
        except AssertionError:
            return HttpResponseBadRequest(
                json.dumps(
                    {'errstr': 'required field missing'}
                ),
                content_type='application/json'
            )

        try:
            assert isinstance(data['size'], int)
            assert isinstance(data['chunksize'], int)
            assert isinstance(data['hash'], str)
            assert isinstance(data['filename'], str)
            session = Session.new(
                data['size'],
                data['hash'],
                data['filename'],
                data['chunksize']
            )
        except AssertionError:
            return HttpResponseForbidden(
                json.dumps(
                    {'errstr': 'invalid value type'}
                ),
                content_type='application/json'
            )

        response = HttpResponse(
            status=201,
            reason='Initialized',
            content_type='application/json'
        )
        response.write(json.dumps({
            'token': session.token
        }))
        return response

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            assert isinstance(data, dict)
        except (ValueError, AssertionError):
            return HttpResponseBadRequest(
                json.dumps({'errstr': 'invalid json format'}),
                content_type='application/json'
            )
        return super(InitView, self).dispatch(request, data, *args, **kwargs)


class ChunkView(View):

    def get(self, request, owner, *args, **kwargs):
        owner = Session.objects.get(token=owner)
        return HttpResponse(json.dumps(
            list(map(lambda chunk: {
                'token': chunk.token,
                'hash': chunk.chunkhash,
                'created_at': chunk.created_at.strftime('%Y-%m-%dT%H:%M:%S'),
                'seq': chunk.chunk_seq,
            }, owner.chunk_set.order_by('chunk_seq')))
        ))

    def put(self, request, owner, *args, **kwargs):
        try:
            assert 'hash' in request.GET
            assert 'seq' in request.GET
        except AssertionError:
            return HttpResponseBadRequest(
                json.dumps({'errstr': 'required GET field missing'}),
                content_type='application/json'
            )
        try:
            seq = int(request.GET['seq'])
            assert seq >= 0
            hash = request.GET['hash'].lower()
            assert len(hash) == 64
            chunk = Chunk.new_chunk(request.body, hash, seq, owner)
        except (ValueError, AssertionError):
            return HttpResponseForbidden(
                json.dumps({'errstr': 'invalid value type'}),
                content_type='application/json'
            )
        except UploadException as e:
            return HttpResponse(
                json.dumps({'errstr': str(e)}),
                status=e.status_code
            )

        response = HttpResponse(
            status=201,
            reason='Stored',
            content_type='application/json'
        )
        response.write(json.dumps({
            'chunk_token': chunk.token,
        }))
        return response

    @method_decorator(csrf_exempt)
    def dispatch(self, request, owner, *args, **kwargs):
        owner = owner.lower()
        if Session.objects.filter(token=owner).exists() is False:
            return HttpResponseNotFound(
                json.dumps({'errstr': 'no such session'}),
                content_type='application/json'
            )
        if Session.objects.filter(token=owner).count() > 1:
            return HttpResponse(
                json.dumps({'errstr': 'duplicated session'}),
                content_type='application/json'
            )
        return super(ChunkView, self).dispatch(request, owner, *args, **kwargs)


class FinalizeView(View):
    def get(self, request, owner, *args, **kwargs):
        owner = owner.lower()
        try:
            new_file = Session.objects.get(token=owner).try_finish()
        except Session.DoesNotExist:
            return HttpResponseNotFound(
                json.dumps({'errstr': 'no such session: %s' % owner}),
                content_type='application/json'
            )
        except UploadException as e:
            return HttpResponse(
                json.dumps({'errstr': str(e)}),
                status=e.status_code
            )
        response = HttpResponse(
            status=201,
            reason='Processed',
            content_type='application/json'
        )
        response.write(json.dumps({
            'token': new_file.token,
            'hash': new_file.filehash,
            'filename': new_file.filename,
            'created': str(new_file.created_at.now()),
            'rec': int(new_file.rec),
        }))
        return response

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super(FinalizeView, self).dispatch(*args, **kwargs)


class DestroyView(View):
    def get(self, request, owner, *args, **kwargs):
        owner = owner.lower()
        try:
            owner = Session.objects.get(token=owner)
            owner.destroy()
        except Session.DoesNotExist:
            pass
        return HttpResponse(
            status=201,
            reason='Deleted',
            content_type='application/json'
        )

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super(DestroyView, self).dispatch(*args, **kwargs)


class PageView(View):
    def get(self, request):
        return render(request, 'upload.html', {})

    def dispatch(self, *args, **kwargs):
        return super(PageView, self).dispatch(*args, **kwargs)
