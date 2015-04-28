from django.http import JsonResponse, Http404, HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User


from guardian.shortcuts import (get_objects_for_user, get_perms,
                                assign_perm, remove_perm)

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


# return what collections the current user
# belongs to as a member(has permission
# 'member')
is_member_of = is_xx_of('group_member')


# return what collections the current user
# belongs to as a admin(has permission
# 'admin')
is_admin_of = is_xx_of('group_admin')


# return what collections the current user
# belongs to as a root(has permission
# 'root')
is_root_of = is_xx_of('group_root')


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
            return HttpResponse("You are not the admin of collection '%s'" % (col.name,), status=401)
    return ret_function


# make some video offshow
off_show = show('off')

# make some video onshow
on_show = show('on')


def add_remove(identity, opt):

    @login_required
    def ret_function(request, collection, username):
        if request.method != 'POST':
            return HttpResponse(status=405)
        try:
            col = Collection.objects.get(name=collection)
        except Exception:
            raise Http404("Collection '%s' does not exists" % (collection,))
        try:
            user = User.objects.get(username=username)
        except Exception:
            raise Http404("User '%s' does not exists" % (username,))

        father_identity = {
            'group_member': 'group_admin',
            'group_admin': 'group_root',
            'group_root': 'superuser',
        }

        if father_identity[identity] in get_perms(request.user, col) or request.is_superuser:
            if opt == 'add':
                assign_perm(identity, user, col)
            elif opt == 'remove':
                remove_perm(identity, user, col)
            return HttpResponse("success!")
        else:
            return HttpResponse("you are not the '%s' of collection '%s'" % (collection, username))
    return ret_function


# add member to collection
add_member = add_remove('group_member', 'add')

# remove member from collection
remove_member = add_remove('group_member', 'remove')

# add admin to collection
add_admin = add_remove('group_admin', 'add')

# remove admin to collection
remove_admin = add_remove('group_admin', 'remove')

# add root to collection
add_root = add_remove('group_root', 'add')

# remove root to collection
remove_root = add_remove('group_root', 'remove')

def get_video_list(request, collection, op):
    try:
        col = Collection.objects.get(name=collection)
    except Exception:
        raise Http404("Collection '%s' doew not exists" % (collection,))
    file_ = FileEXT.objects.filter(collection=col)
    if request.user.has_perm('admin', col):
        file_ = file_.include(onshow=True)
    return JsonResponse(
        list(
            map(
                lambda file_: {
                    'rec': file_.base.rec,
                    'filename': file_.base.filename,
                    'onshow': file_.onshow,
                    'playCount': file_.play_count
                },
                file_
            )
        ),
        safe=False
    )


def public_collections(request):
    return JsonResponse(
        list(
            map(
                lambda col: {
                    'name': col.name,
                },
                Collection.objects.all()
            )
        ),
        safe=False
    )
