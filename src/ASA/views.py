from django.http import HttpResponse


def app(request):
    with open('app/guide.html') as f:
        s = f.read()
    return HttpResponse(s)
