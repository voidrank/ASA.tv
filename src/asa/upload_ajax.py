from django.shortcuts import get_object_or_404

from chunked_upload.views import ChunkedUploadCompleteView as BaseChunkedUploadCompleteView
from chunked_upload.views import ChunkedUploadView as BaseChunkedUploadView
from chunked_upload.exceptions import ChunkedUploadError

from .models import (Video, ChunkedUpload, Collection)


def check_permissions(self, request):
    if (request.user.is_superuser is False):
        raise ChunkedUploadError(status=403,
                                 detail="You are not a memeber of collection '%s'" % request.POST.get('collections'))


class ChunkedUploadView(BaseChunkedUploadView):

    model = ChunkedUpload
    field_name = 'name'

    def check_permissions(self, request):
        # Allow non authenticated users to make upload
        check_permissions(self, request)


class ChunkedUploadCompleteView(BaseChunkedUploadCompleteView):

    model = ChunkedUpload

    def check_permissions(self, request):
        # Allow non authenticated users to make uploads
        # need more details
        check_permissions(self, request)

    def get_response_data(self, chunked_upload, request):
        uploaded_file=chunked_upload.get_uploaded_file()
        collection = get_object_or_404(Collection, name=request.POST.get('collection'))
        filename = request.POST.get('filename')
        video = Video.objects.create(
            uploader=request.user,
            file=uploaded_file,
            collection=collection,
            filename=filename,
        )
        return {'res': video.rec}
