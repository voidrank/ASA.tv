from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings

from website.upload_ajax import (ChunkedUploadView,
                                 ChunkedUploadCompleteView)

urlpatterns = patterns(
    '',
    # Examples:
    # url(r'^$', 'ASA.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    # grapelli
    url(r'^grappelli/', include('grappelli.urls')),


    # admin
    url(r'^admin/', include(admin.site.urls)),


    # logIO
    url(r'^accounts/login/$', 'django.contrib.auth.views.login',
        {'template_name': 'admin/login.html'}),
    url(r'^accounts/logout/$', 'django.contrib.auth.views.logout',
        {'template_name': 'logged_out.html'}),


    # angularjs app
    url(r'^$', 'ASA.views.app'),
    url(r'^home/$', 'ASA.views.app'),
    url(r'rec/[0-9]+', 'ASA.views.app'),


    # AJAX

    # django stream response
    url(r'api/resource/(?P<token>[a-zA-Z0-9]{64})/?$', 'video_cms.player_views.DownloadView'),

    # video
    url(r'api/video/cover/(?P<rec>[0-9]+)', 'website.video_ajax.video_cover_ajax'),
    url(r'api/video/myupload/', 'website.video_ajax.myupload'),
    url(r'api/video/recToToken/(?P<rec>[0-9]+)', 'website.video_ajax.getVideoToken'),
    # Chinese support
    url(r'api/video/search/(?P<filename>[＼x80-＼xffa-zA-Z0-9])', 'website.video_ajax.search'),

    # upload
    url(r'^api/chunked_upload/?$',
        ChunkedUploadView.as_view()),
    url(r'^api/chunked_upload_complete/?$',
        ChunkedUploadCompleteView.as_view()),

    # collection
    url(r'api/collection/is_member_of', 'website.collection_ajax.is_member_of'),
    url(r'api/collection/is_admin_of', 'website.collection_ajax.is_admin_of'),
    url(r'api/collection/is_root_of', 'website.collection_ajax.is_root_of'),
    url(r'api/collection/offshow/(?P<token>[a-fA-F0-9]{64}/?)', 'website.collection_ajax.off_show'),
    url(r'api/collection/onshow/(?P<token>[a-fA-F0-9]{64}/?)', 'website.collection_ajax.on_show'),
    url(r'api/collection/add/member/(?P<collection>[a-zA-Z0-9]*)/(?P<username>[a-zA-Z0-9]*)/', 'website.collection_ajax.add_member'),
    url(r'api/collection/remove/member/(?P<collection>[a-zA-Z0-9_]*)/(?P<username>[a-zA-Z0-9_]*)/', 'website.collection_ajax.remove_member'),
    url(r'api/collection/add/admin/(?P<collection>[a-zA-Z0-9_]*)/(?P<username>[a-zA-Z0-9_]*)/', 'website.collection_ajax.add_admin'),
    url(r'api/collection/remove/admin/(?P<collection>[a-zA-Z0-9_]*)/(?P<username>[a-zA-Z0-9_]*)/', 'website.collection_ajax.remove_admin'),
    url(r'api/collection/add/root/(?P<collection>[a-zA-Z0-9_]*)/(?P<username>[a-zA-Z0-9_]*)/', 'website.collection_ajax.add_root'),
    url(r'api/collection/remove/root/(?P<collection>[a-zA-Z0-9_]*)/(?P<username>[a-zA-Z0-9_]*)/', 'website.collection_ajax.remove_root'),
    url(r'api/collection/video/(?P<collection>[＼x80-＼xffa-zA-Z0-9]*)/(?P<op>[0-9]*)/', 'website.collection_ajax.get_video_list'),
    url(r'api/collection/public', 'website.collection_ajax.public_collections'),

    # danmaku
    url(r'api/danmaku/(?P<token>[a-zA-Z0-9]{64})/?', 'website.danmaku_ajax.danmaku'),

    # index
    url(r'api/index', 'website.index_ajax.index'),
) + static('/app/', document_root='app') + static('/static/', document_root='static')

urlpatterns = patterns(
    '',
    url(settings.PREFIX_URL, include(urlpatterns)),

    # user
    url(r'api/user/user_log_io', 'website.user_ajax.UserLogIO')
)
