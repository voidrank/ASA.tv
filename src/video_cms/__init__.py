from django.conf.urls import patterns, url
from .upload_views import (InitView,
                           ChunkView, FinalizeView,
                           DestroyView, PageView)
from django.views.decorators.csrf import csrf_exempt

__all__ = ['exceptions', 'models', 'upload_views', 'player_views']

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
        csrf_exempt(DestroyView.as_view()),
        name='destroy'
    ),

    url(
        r'^upload/$',
        PageView.as_view(),
        name="upload"
    )
)
