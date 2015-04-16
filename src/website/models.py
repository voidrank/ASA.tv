from django.db import models
from django.contrib.auth.models import Group, User

import video_cms.models

from .fields import ListField

# Create your models here.


class SessionEXT(models.Model):
    session = models.OneToOneField(
        'video_cms.Session',
        related_name='ext'
    )
    uploader = models.ForeignKey(
        'auth.User'
    )
    collection = models.ForeignKey('Collection')


class Collection(Group):
    parent_col = models.ForeignKey(
        'website.Collection',
        default=None,
        blank=True,
        null=True
    )
    abstract = models.BooleanField(default=False)

    def __str__(self):
        return str(self.name)

    class Meta:
        permissions = (
            ('group_member', 'Group Member'),
            ('group_admin', 'Group Admin'),
            ('group_root', 'Group Root'),
        )


class FileEXT(models.Model):
    base = models.OneToOneField(
        'video_cms.File',
        related_name='ext',
        unique=True
    )
    uploader = models.ForeignKey('auth.User')
    collection = models.ForeignKey('Collection')
    onshow = models.BooleanField(default=False)
    play_count = models.PositiveIntegerField(default=0)


class Danmaku(models.Model):
    id = models.IntegerField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey('auth.user')
    owner = models.ForeignKey('video_cms.File', db_index=True, on_delete=models.PROTECT)
    mode = models.IntegerField()
    stime = models.IntegerField()
    date = models.PositiveIntegerField()
    text = models.CharField(max_length=128)
    size = models.IntegerField()
    color = models.CharField(max_length=16)

    @staticmethod
    def new(owner=None,
            user=None,
            date=None,
            mode=1,
            stime=0,
            text="",
            size=30,
            color=0xffffff):
        assert isinstance(user, User) is True
        assert isinstance(owner, str) is True
        assert isinstance(mode, int) is True
        assert isinstance(stime, int) is True
        assert isinstance(text, str) is True
        assert isinstance(size, int) is True
        assert isinstance(color, str) is True
        assert isinstance(date, int) is True
        assert video_cms.models.File.objects.filter(token=owner).count() == 1
        owner = video_cms.models.File.objects.get(token=owner)
        Danmaku.objects.create(
            owner=owner,
            user=user,
            mode=mode,
            stime=stime,
            text=text,
            size=size,
            color=color,
            date=date
        )

    @staticmethod
    def load_danmaku_by_video_token(token):
        assert video_cms.models.File.objects.filter(token=token).count() == 1
        video = video_cms.models.File.objects.get(token=token)
        danmaku = list(
            map(lambda danmaku: {
                # 'owner': danmaku.owner,
                'mode': danmaku.mode,
                'stime': danmaku.stime,
                'text': danmaku.text,
                'size': danmaku.text,
                'color': danmaku.color,
                'date': danmaku.date
            }, video.danmaku_set.all())
        )
        return danmaku


class Comment(models.Model):
    id = models.IntegerField(primary_key=True)
    owner = models.ForeignKey('video_cms.File', db_index=True, on_delete=models.PROTECT)
    created_at = models.DateTimeField()
    text = models.CharField(max_length=1024)


class BasePerInfoMetaclass(type(models.Model)):
    Register = {}

    def __init__(cls, name, base, nmspc):
        super(BasePerInfoMetaclass, cls).__init__(name, base, nmspc)
        BasePerInfoMetaclass.Register[name.lower()] = cls


class BasePerInfo(models.Model, metaclass=BasePerInfoMetaclass):
    user = models.OneToOneField('auth.User', related_name='%(class)s')

    class Meta:
        abstract = True

    def as_dict(self):
        ret = {}
        for k in self.display:
            ret[k] = self.__dict__[k]
        return ret


class AvatarPerInfo(BasePerInfo):
    avatar = models.ImageField(upload_to='avatar', null=True, blank=True)


class AdvancedPerInfo(BasePerInfo):
    default_chunksize = models.IntegerField()
    default_path = ListField()

    display = ('default_chunksize', 'default_path')


class LoginLog(models.Model):
    user = models.ForeignKey('auth.User')
    login_ip = models.GenericIPAddressField()
    login_time = models.DateTimeField()


# index
class Recommandation(models.Model):
    id = models.AutoField(primary_key=True)
    col = models.IntegerField()
    index = models.IntegerField()
    rec = models.IntegerField(null=True, blank=True)
    img = models.ImageField(upload_to="recommandation")
    title = models.TextField()
    description = models.TextField(null=True, blank=True)
    link = models.URLField(null=True, blank=True)

    def __str__(self):
        return "Recommandation %s, index %s" % (self.col, self.index)
