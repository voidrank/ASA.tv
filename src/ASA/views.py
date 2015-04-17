from django.http import HttpResponse


def app(request):
    with open('app/guide.html', 'rt') as f:
        s = f.read()
    return HttpResponse(s)
