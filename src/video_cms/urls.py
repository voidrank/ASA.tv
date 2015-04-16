from django.conf.urls import patterns, url, include
from .player_views import MediaView, DownloadView, DanmakuView


urlpatterns_download = patterns(
    '',
    url(r'^rec/(?P<filename>[a-zA-Z0-9_]{1,64})/?$', MediaView.as_view()),
    url(r'^download/(?P<token>[a-zA-Z0-9]{64})/?$', DownloadView.as_view())
)

urlpatterns_danmaku = patterns(
    '',
    url(
        r'danmaku/(?P<token>[a-zA-Z0-9]{64})/?',
        DanmakuView.as_view()
    ),
)


urlpatterns = patterns(
    '',
    # url('', include(urlpatterns_upload)),
    url('', include(urlpatterns_download)),
    # url('', include(urlpatterns_danmaku)),
)
