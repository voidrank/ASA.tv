from django.conf import settings
from os.path import dirname, isdir, exists
from os import makedirs
import os

DEFAULT_VIDEO_COVER_DIR = os.path.join(dirname(__file__), 'video_cover')
VIDEO_COVER_DIR = getattr(settings, 'VIDEO_COVER_DIR', DEFAULT_VIDEO_COVER_DIR)
settings.VIDEO_COVER_DIR = VIDEO_COVER_DIR

if exists(VIDEO_COVER_DIR):
    if not isdir(VIDEO_COVER_DIR):
        raise ValueError('not a directory: %s' % VIDEO_COVER_DIR)
else:
    makedirs(VIDEO_COVER_DIR)

DEFAULT_HOMEPAGE = "/homepage/"
HOMEPAGE = getattr(settings, 'HOMEPAGE', DEFAULT_HOMEPAGE)
settings.HOMEPAGE = HOMEPAGE

AVATAR_SIZE_LIMIT = 524288

DEFAULT_AVATAR_ROOT = os.path.join(dirname(__file__), 'avatar/')
AVATAR_ROOT = getattr(settings, 'AVATAR_ROOT', DEFAULT_AVATAR_ROOT)

if exists(AVATAR_ROOT):
    if not isdir(AVATAR_ROOT):
        raise ValueError('not a directory: %s' % AVATAR_ROOT)
else:
    makedirs(AVATAR_ROOT)

DEFAULT_INDEX = '/'
INDEX = getattr(settings, 'INDEX', DEFAULT_INDEX)
settings.INDEX = INDEX
