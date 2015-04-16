from django.conf.urls import patterns, url, include

from .views import *
from .upload_ajax import *
from .collection_ajax import *
from .user_ajax import *
from .video_ajax import *
from .index_ajax import *
from .danmaku_ajax import *

urlpatterns_danmaku = patterns(
    '',
    url(
        r'danmaku/(?P<token>[a-zA-Z0-9]{64})/?',
        DanmakuView.as_view(),
        name='danmaku'
    ),
)


urlpatterns_video_list = patterns(
    '',
    url(
        r'video_list/',
        video_list,
        name='video_list'
    )
)

urlpatterns_perinfo = patterns(
    r'',
    url(
        r'homepage/genericperinfo',
        GenericPerInfo,
        name='GenericPerInfo'
    ),
    url(
        r'homepage/advancedperinfo',
        AdvancedPerInfo,
        name='AdvancedPerInfo'
    ),
    url(
        r'homepage/myupload/',
        myupload,
        name='myupload'
    ),
    url(
        r'homepage/mygroup/',
        mygroup,
        name='mygroup'
    ),
    url(
        r'homepage/avatar/',
        AvatarView.as_view(),
        name='AvatarView'
    ),
)


urlpatterns_register = patterns(
    r'',
    url(
        r'register/',
        register.as_view(),
        name='register'
    )
)


urlpatterns_homepage = patterns(
    r'',
    url(
        r'homepage/',
        homepage,
        name='homepage'
    ),
)

urlpatterns = patterns(
    r'',
    url(r'api', include(urlpatterns_perinfo)),
    url(r'api', include(urlpatterns_register)),
    url(r'api', include(urlpatterns_homepage)),
    url(r'', include(urlpatterns_upload)),
    url(r'api', include(urlpatterns_danmaku)),
    url(r'api', include(urlpatterns_video_list)),
    url(r'api/collection', include(urlpatterns_collection)),
    url(r'api/user', include(urlpatterns_user)),
    url(r'', include(urlpatterns_video)),
    url(r'api/index', include(urlpatterns_index)),
    url(r'rec/(?P<rec>[0-9]*/?)', MediaView.as_view())
)
