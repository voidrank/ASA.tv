from django.contrib import admin
from .models import *

# Register your models here.

admin.site.register(SessionExt)
admin.site.register(Collection)
admin.site.register(File)


for cls in BasePerInfoMetaclass.Register.values():
    try:
        admin.site.register(cls)
    except:
        pass
