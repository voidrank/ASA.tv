from django.conf.urls import patterns, url
from django.http import HttpResponse


def get_cover(request, rec):
    try:
        with open('website/video_cover/%s' % (rec,), 'rb') as f:
            pic = f.read()
    except Exception:
        with open('website/video_cover/default', 'rb') as f:
            pic = f.read()
    return HttpResponse(pic, content_type='image')

urlpatterns_video = patterns(
    '',
    url(r'cover/(?P<rec>[0-9]+)', get_cover)
)
