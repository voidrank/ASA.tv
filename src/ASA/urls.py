from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings

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
    url(r'', include('website.urls')),

    # video
    url(r'api/video/cover/(?P<rec>[0-9]+)', 'website.video_ajax.video_cover_ajax'),
    url(r'api/video/myupload/', 'website.video_ajax.myupload'),
    url(r'api/video/recToToken/(?P<rec>[0-9]+)', 'website.video_ajax.getVideoToken'),

    # upload
    url(r'api/upload/init/?', 'website.upload_ajax.init'),
    url(r'api/upload/chunk/(?P<owner>[a-fA-F0-9]{64})/?', 'website.upload_ajax.chunk'),
    url(r'api/upload/store/(?P<owner>[a-fA-F0-9]{64})/?', 'website.upload_ajax.finalize'),
    url(r'api/upload/destroy/(?P<owner>[a-fA-F0-9]{64}/?)', 'website.upload_ajax.destroy'),
    url(r'api/upload/session/$', 'website.upload_ajax.session'),

    # collection
    url(r'', include('website.collection_ajax')),

    # danmaku
    url(r'api/danmaku/(?P<token>[a-zA-Z0-9]{64})/?', 'website.danmaku_ajax.danmaku'),

    # index
    url(r'api/index', 'website.index_ajax.index'),
) + static('/app/', document_root='app') + static('/static/', document_root='static')

urlpatterns = patterns(
    '',
    url(settings.PREFIX_URL, include(urlpatterns)),
)
