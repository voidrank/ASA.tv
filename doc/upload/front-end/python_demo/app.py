from urllib.request import urlopen, Request
from urllib.parse   import urlencode
from hashlib import sha256  
import simplejson as json
import os

class Client:

    def __init__(self):
        config          = json.loads(open("config.json","r").read())
        self.filename   = config["filename"]
        self.filesize   = os.path.getsize(self.filename)
        self.chunksize  = config["chunksize"]
        self.url        = config["url"]
        self.file       = open(self.filename, "rb")
        self.content    = self.file.read()
        self.set_chunk()

    def set_chunk(self):
        self.chunk_list = []
        for i in range((self.filesize-1)//self.chunksize):
            self.chunk_list.append(i*self.chunksize)
        self.chunk_list.append(self.filesize)

    def init(self):
        url     = self.url + "upload/init/"
        hash    = sha256(self.content).hexdigest()
        data    = {
            'size':         self.filesize,
            'hash':         hash,
            'filename':     self.filename,
            'chunksize':    self.chunksize
        }
        request = Request(url,
            data    = bytes(json.dumps(data),'UTF-8'),
            method  = "POST"
        )
        try:
            response = urlopen(request)
        except Exception as e:
            raise Exception(e.read())
        self.token = json.loads(response.read())['token']
        print("Upload init successfully. token: %s \n" % (self.token,))

    def post_single_chunk(self, seq):
        offset      = self.chunksize * seq
        self.file.seek(offset, 0)
        chunksize   = self.chunk_list[seq+1]-self.chunk_list[seq]
        content     = self.file.read(chunksize)
        hash        = sha256(content).hexdigest()
        get_data = {
            'hash': hash,
            'seq':  seq,
        }
        url         = self.url + 'upload/chunk/%s/?%s' % (self.token, urlencode(get_data))
        request = Request(url, 
            data    = content,
            method  = 'PUT'
        )
        try:
            response = urlopen(request)
        except Exception as e:
            raise Exception(str(e.read(), 'UTF-8'))

    def get_current_chunks_message(self):
        pass

    def store(self):
        token   = self.token
        url     = self.url + 'upload/store/%s' % token
        try:
            response = urlopen(url)
        except Exception as e:
            raise Exception(e.read())
        print(response.read())
        print("Upload successfully!")

    def main(self):
        self.init()
        for i in range(len(self.chunk_list)-1):
            self.post_single_chunk(i)
        self.store()

client = Client()
client.main()
