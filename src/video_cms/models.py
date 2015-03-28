from django.db import models
from hashlib import sha256
from .exceptions import *
from .settings import CHUNKS_DIR, FILES_DIR, MIN_CHUNK_SIZE, STREAM_CHUNK_SIZE
import os

# Create your models here.


class File(models.Model):
    rec = models.AutoField(primary_key=True)
    size = models.BigIntegerField()
    token = models.CharField(max_length=64, unique=True)
    filehash = models.CharField(max_length=64)
    filename = models.TextField(max_length=4096)
    created_at = models.DateTimeField()
    finished_at = models.DateTimeField(auto_now_add=True)

    @staticmethod
    def get_token_by_name(filename):
        assert File.objects.filter(filename=filename).count() == 1
        return File.objects.get(filename=filename).token

    @staticmethod
    def get_token_by_rec(rec):
        assert File.objects.filter(rec=rec).count() == 1
        return File.objects.get(rec=rec).token

    @staticmethod
    def get_chunk_by_token(token, stream_op):
        try:
            with open(os.path.join(FILES_DIR, token), "rb") as f:
                f.seek(stream_op, 0)
                size = os.path.getsize(os.path.join(FILES_DIR, token))
                stream_ed = min(stream_op + STREAM_CHUNK_SIZE - 1, size - 1)
                return stream_ed, f.read(STREAM_CHUNK_SIZE), size
        except Exception:
            raise FileNotFound(
                "the file with the specified token does not exist"
            )

    def __str__(self):
        return self.filename


class Session(models.Model):
    id = models.IntegerField(primary_key=True)
    size = models.BigIntegerField()
    chunk_size = models.IntegerField()
    token = models.CharField(max_length=512, unique=True)
    filehash = models.CharField(max_length=64)
    filename = models.TextField(max_length=4096)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.token

    @staticmethod
    def new(size, hash, name, chunk_size):
        assert '/' not in name
        assert '\\' not in name
        assert '\0' not in name
        assert len(hash) == 64
        assert chunk_size < (1 << 31)
        obj = Session()
        obj.size = size
        obj.filehash = hash
        obj.filename = name
        obj.token = sha256(os.urandom(32)).hexdigest()
        obj.chunk_size = chunk_size
        assert Session.objects.filter(token=obj.token).count() == 0
        obj.save()
        return obj

    def try_finish(self):
        chunks = self.chunk_set.order_by('chunk_seq')
        hash_result = sha256()
        prev_seq = -1
        size = 0
        for chunk in chunks:
            if chunk.chunk_seq != prev_seq + 1:
                raise IncompleteUpload('Missing chunk %d' % (prev_seq + 1))
            prev_seq += 1
            with open(CHUNKS_DIR + '/' + chunk.token, 'rb') as f:
                while True:
                    part = f.read(4096)
                    if not part:
                        break
                    hash_result.update(part)
            size += chunk.size
        if size != self.size:
            raise ContentMismatch(
                'size mismatch. expect=%d bytes, now=%d bytes' %
                (self.size, size)
            )
        if hash_result.hexdigest() != self.filehash:
            raise ContentMismatch('hash mismatch.')
        # Upload ok.
        new_fd = open(FILES_DIR + '/' + self.token, 'wb')
        new_file = File()
        new_file.size = self.size
        new_file.token = self.token
        new_file.filehash = self.filehash
        new_file.filename = self.filename
        new_file.created_at = self.created_at
        new_file.save()
        for chunk in chunks:
            with open(CHUNKS_DIR + '/' + chunk.token, 'rb') as f:
                while True:
                    part = f.read(4096)
                    if not part:
                        break
                    new_fd.write(part)
        for chunk in chunks:
            os.unlink(CHUNKS_DIR + '/' + chunk.token)
            chunk.delete()
        self.delete()
        return new_file

    def destroy(self):
        # TODO: Implements destroy method.
        for chunk in self.chunk_set.all():
            os.unlink(CHUNKS_DIR + '/' + chunk.token)
            chunk.delete()
        self.delete()


class Chunk(models.Model):
    id = models.IntegerField(primary_key=True)
    token = models.CharField(max_length=64, unique=True)
    chunkhash = models.CharField(max_length=64)
    chunk_seq = models.IntegerField()
    owner = models.ForeignKey(Session, db_index=True, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    size = models.BigIntegerField()

    @staticmethod
    def new_chunk(content,
                  chunkhash,
                  chunk_seq,
                  owner,
                  replace_on_duplicate=False):
        size = len(content)
        if size < MIN_CHUNK_SIZE:
            raise ChunkSizeTooSmall(
                'expect %d bytes or larger, got %d bytes' %
                (MIN_CHUNK_SIZE, size)
            )
        if sha256(content).hexdigest() != chunkhash:
            raise ContentMismatch('hash mismatch')
        if isinstance(owner, str):
            try:
                owner = Session.objects.get(token=owner)
            except Session.DoesNotExist:
                raise NoSuchSession('no such session: %s' % owner)
        obj = Chunk()
        if owner.chunk_set.filter(chunk_seq=chunk_seq).count() > 0:
            if not replace_on_duplicate:
                raise DuplicateChunk('duplicated chunk: #%d' % chunk_seq)
            else:
                obj = owner.chunk_set.get(chunk_seq=chunk_seq)
        token = sha256(os.urandom(32)).hexdigest()
        with open(CHUNKS_DIR + '/' + token, 'wb') as f:
            f.write(content)
        obj.size = size
        obj.token = token
        obj.chunkhash = chunkhash
        obj.chunk_seq = chunk_seq
        obj.owner = owner
        obj.save()
        return obj
