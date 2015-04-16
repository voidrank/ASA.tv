from django.conf.urls import url, patterns
from django.http import JsonResponse
from .models import *


def get_index_info(request):
    return JsonResponse({
        'recommandation': sorted(
            list(
                map(
                    lambda rcm: {
                        'col': rcm.col,
                        'index': rcm.index,
                        'link': rcm.link,
                        'title': rcm.title,
                        'description': rcm.description,
                        'src': rcm.img.url,
                        'rec': rcm.rec,
                    },
                    Recommandation.objects.all()
                ),
            ),
            key=lambda x: (x['col'], x['index'])
        ),
        'rankList': list(
            map(
                lambda rk: {
                    'rec': rk.base.rec,
                    'filename': rk.base.filename
                },
                FileEXT.objects.all().order_by('play_count')
            )
        )
    })


urlpatterns_index = patterns(
    '',
    url(r'', get_index_info),
)
