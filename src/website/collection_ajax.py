from django.http import JsonResponse, Http404, HttpResponse
from django.contrib.auth.decorators import login_required
from django.conf.urls import patterns, url
from django.contrib.auth.models import User


from guardian.shortcuts import get_objects_for_user, get_perms

from video_cms.models import *

from .exceptions import *
from .models import *


def is_xx_of(identity):

    @login_required
    def ret_function(request):
        if request.user.is_superuser is True:
            return JsonResponse(
                list(
                    map(
                        lambda col: {
                            'name': col.name
                        },
                        Collection.objects.filter(abstract=False)
                    ),
                ),
                safe=False
            )
        else:
            return JsonResponse(
                list(
                    map(
                        lambda col: {
                            'name': col.name
                        },
                        get_objects_for_user(request.user, 'website.' + identity)
                    )
                ),
                safe=False
            )
    return ret_function


def show(opt):
    
    @login_required
    def ret_function(request, token):
        try:
            file_ = File.objects.get(token=token)
        except Exception:
            raise Http404("File with token '%s' does not exists" % (token,))
        col = file_.ext.collection
        if 'group_admin' in get_perms(request.user, col):
            if opt == 'on':
                file_.onshow = True
            else:
                file_.onshow = False
            file_.save()
        else:
            return HttpResponse("You are not the admin of collection '%s'" % (col.name,), status_code=401)
            
    return ret_function


def member(opt):

    @login_required
    def ret_function(request, collection, username):
        print(collection)
        print(username)
        try:
            col = Collection.objects.get(name=collection)
        except Exception:
            raise Http404("Collection '%s' does not exists" % (collection,))
        try:
            user = User.objects.get(username=username)
        except Exception:
            raise Http404("User '%s' does not exists" % (username,))
        if 'group_admin' in get_perms(request.user, col):
            if opt == 'add':
                col.user_set.add(user)
            elif opt == 'remove':
                col.user_set.remove(user)
        return HttpResponse("success!")
    return ret_function


urlpatterns_collection = patterns(
    '',
    # return what collections the current user
    # belongs to as a member(has permission
    # 'member')
    url(
        r'is_member_of',
        is_xx_of('group_member')
    ),
    # return what collections the current user
    # belongs to as a admin(has permission
    # 'admin')
    url(
        r'is_admin_of',
        is_xx_of('group_admin')
    ),
    # return what collections the current user
    # belongs to as a root(has permission
    # 'root')
    url(
        r'is_root_of',
        is_xx_of('group_root')
    ),
    # make some video offshow
    url(
        r'offshow/(?P<token>[a-fA-F0-9]{64}/?)',
        show('off'),
    ),
    # make some video onshow
    url(
        r'onshow/(?P<token>[a-fA-F0-9]{64}/?)',
        show('on'),
    ),
    # add member from collection
    url(
        r'add/member/(?P<collection>[a-zA-Z0-9]*)/(?P<username>[a-zA-Z0-9]*)/',
        member('add')
    ),
    url(
        r'remove/member/(?P<collection>[a-zA-Z0-9_]*)/(?P<username>[a-zA-Z0-9_]*)/',
        member('remove')
    ),
)
