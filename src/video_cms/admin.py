from django.contrib import admin
from .player_views import *

# Register your models here.

admin.site.register(File)
admin.site.register(Session)
admin.site.register(Chunk)
