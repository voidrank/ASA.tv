class BaseException(Exception):

    def __init__(self, why):
        self.reason = why

    def __str__(self):
        return self.reason


class Unanuthorized(BaseException):
    status_code = 403


class NoSuchCollection(BaseException):
    status_code = 404


class CollectionIsAbstract(BaseException):

    def __str__(self):
        return "%s is a abstract collection" % (self.reason, )


class CollectionNotFound(BaseException):

    def __str__(self):
        return "Collection %s not found" % (self.reason,)
