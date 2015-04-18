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

    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/login/$', 'django.contrib.auth.views.login',
        {'template_name': 'admin/login.html'}),
    url(r'^accounts/logout/$', 'django.contrib.auth.views.logout',
        {'template_name': 'logged_out.html'}),
    url(r'^$', 'ASA.views.app'),
    url(r'^home/$', 'ASA.views.app'),
    url(r'', include('website.urls')),
    url(r'rec/[0-9]+', 'ASA.views.app'),
    url(r'api/resource/(?P<token>[a-zA-Z0-9]{64})/?$', 'video_cms.player_views.DownloadView'),
) + static('/app/', document_root='app') + static('/static/', document_root='static')

urlpatterns = patterns(
    '',
    url(settings.PREFIX_URL, include(urlpatterns)),
)
