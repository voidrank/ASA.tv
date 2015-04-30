from django.core.files import File

from chunked_upload.models import ChunkedUpload as BaseChunkedUpload
from chunked_upload.views import ChunkedUploadCompleteView as BaseChunkedUploadCompleteView
from chunked_upload.views import ChunkedUploadView as BaseChunkedUploadView

from .models import (VideoFile, ChunkedUpload)


class ChunkedUploadView(BaseChunkedUploadView):

    model = ChunkedUpload
    field_name = 'name'

    def check_permissions(self, request):
        # Allow non authenticated users to make upload
        pass


class ChunkedUploadCompleteView(BaseChunkedUploadCompleteView):
    
    model = ChunkedUpload

    def check_permissions(self, request):
        # Allow non authenticated users to make uploads
        pass

    def on_completion(self, uploaded_file, request):
        # Do something with uploaded file. E.g.:
        # * Store the uploaded file on another model
        # SomeModel.objects.create(user=request.user, file=uploaded_file
        # * Pass it as an argument to a function
        # function_that_process_file(uploaded_file)
        VideoFile.objects.create(
            uploader=request.user,
            md5=request.POST.get('md5'),
            file=uploaded_file,
        )

    def get_response_data(self, chunked_upload, request):
        return {'message': 'You successfully uploaded this file'}
