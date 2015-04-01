from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf.urls.static import static

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
    url(r'api/', include('website.urls')),
) + \
    static('/app/', document_root='app')
