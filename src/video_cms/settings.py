#!/usr/bin/env python
# -*- encoding: utf-8 -*-

from django.conf import settings
from os.path import dirname, isdir, exists
from os import makedirs

DEFAULT_CHUNKS_DIR = dirname(__file__) + '/chunks'
CHUNKS_DIR = getattr(settings, 'CHUNKS_DIR', DEFAULT_CHUNKS_DIR)

if exists(CHUNKS_DIR):
    if not isdir(CHUNKS_DIR):
        raise ValueError('not a directory: %s' % CHUNKS_DIR)
else:
    makedirs(CHUNKS_DIR)

DEFAULT_FILES_DIR = dirname(__file__) + '/files'
FILES_DIR = getattr(settings, 'FILES_DIR', DEFAULT_FILES_DIR)

if exists(FILES_DIR):
    if not isdir(FILES_DIR):
        raise ValueError('not a directory: %s' % FILES_DIR)
else:
    makedirs(FILES_DIR)

# 64KiB
DEFAULT_MIN_CHUNK_SIZE = 65536
MIN_CHUNK_SIZE = getattr(settings, 'MIN_CHUNK_SIZE', DEFAULT_MIN_CHUNK_SIZE)

DEFAULT_STREAM_CHUNK_SIZE = 262144
STREAM_CHUNK_SIZE = getattr(settings, "STREAM_CHUNK_SIZE", DEFAULT_STREAM_CHUNK_SIZE)
