from django.http import HttpResponseBadRequest, HttpResponseForbidden, HttpResponse, HttpResponseNotFound

import simplejson as json
import os
import urllib
import random
from hashlib import sha256
from base64 import b64encode

from django.test import TestCase, Client

class TestError(Exception):
    pass

def read_by_chunk(f, chunksize):
    assert isinstance(f, file)
    assert isinstance(chunksize, int)

class QuestionMethodTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.file_name = 'test_post_file'
        self.file_object = open(self.file_name, 'rb')
        self.file_size = os.path.getsize(self.file_name)
        self.chunk_size = 65536
        self.set_chunk()

    def set_chunk(self):

        self.chunk_list = []

        for i in range((self.file_size-1)//self.chunk_size):
            self.chunk_list.append(i*self.chunk_size)
        self.chunk_list.append(self.file_size)


    def init_post(self):

        # client
        client = self.client

        # file message
        file_object = self.file_object
        file_name = self.file_name
        file_size = self.file_size
        chunk_size = self.chunk_size
        content = open(file_name, 'rb').read()

        # set post_data
        post_data = {
            'size':                 file_size,
            'hash':                 sha256(content).hexdigest(),#.decode('utf-8'),
            'filename':             file_name,
            'chunksize':            chunk_size,
        }

        # request& response
        response = client.post('/upload/init', data=json.dumps(post_data), content_type='application/json')

        # assert response
        try:
            assert type(response) == HttpResponse
        except AssertionError as e:
            raise AssertionError(str(response.content))

        # save token
        response_content = json.loads(response.content)
        token = response_content['token']
        self.token = token


    def get_current_chunk_message(self):

        # client
        client = self.client

        # message
        token = self.token

        # request& response
        # raise Exception(type(token))
        url = '/upload/chunk/%s' % token
        response = client.get(url)

        # assert response
        try:
            assert type(response) ==  HttpResponse
        except:
            raise Exception(response.content)

        # response content
        response_content = json.loads(response.content)

        # return chunk message
        return set(list(map(lambda chunk : chunk['seq'], response_content))) 


    def get_chunks_num(self):

        file_size = self.file_size
        chunk_size = self.chunk_size

        return (file_size + chunk_size - 1)//chunk_size



    def put_chunk(self, seq):

        # client
        client = self.client

        # message
        seq
        file_object = self.file_object
        offset = self.chunk_list[seq]
        size = self.chunk_list[seq+1] - self.chunk_list[seq]
        file_object.seek(offset, 0)
        content = file_object.read(size)
        hash = sha256(content).hexdigest()
        token = self.token

        # data
        urldata = {
            'hash': hash,
            'seq': seq
        }

        # request& response
        response = client.put(
                '/upload/chunk/%s/?%s' % (token, urllib.parse.urlencode(urldata)), 
                data = content, 
                content_type = 'video/mp4'
        )

        return response
            
    def store(self):
        
        # client
        client = self.client

        # token
        token = self.token
        
        # request& response
        response = client.get('/upload/store/%s' % token)

        # echo response
        try:
            assert type(response) == HttpResponse
        except:
            raise Exception(json.loads(response.content))


    def test_upload(self):

        # init post
        self.init_post()

        # get current stored chunks
        stored_chunks_set = self.get_current_chunk_message()

        # put
        for i in range(len(self.chunk_list)-1):
            if i not in stored_chunks_set:
                response = self.put_chunk(i)
                print(Exception(response.content))

        # store 
        self.store()

    def test_bad_chunks(self):
        pass
    '''
        # client
        self.init_post()

        # get current stored chunks
        stored_chunks_set = self.get_current_chunk_message()
        
        # upload some chunks of the file
        for i in range((file_size+chunk_size-1)//chunk_size):
            if random.random()>0.5:
                response = self.put_chunk(file_object, i)
                assert type(response) == HttpResponse

        # check uploaded chunks
        for i in range((file_size+chunk_size-1)//chunk_size):
            if i in stored_chunks_set:
                self.put_chunk(file_object, i)
                assert
     '''
