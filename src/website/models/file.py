from django.db import models


class BaseFile(models.Model):
    # use md5 as filename
    md5 = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    uploader = models.ForeignKey('auth.User')
    file = models.FileField(max_length=255)

    class Meta:
        abstract = True


class VideoFile(BaseFile):
    rec = models.AutoField(primary_key=True)
    onshow = models.BooleanField(default=False)
    play_count = models.PositiveIntegerField(default=True)
