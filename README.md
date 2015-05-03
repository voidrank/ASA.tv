# ASA.tv
=============================
#### ASA.tv 计划
* 开源项目
* 示例: [复旦大学学生网视频站](http://stu.fudan.edu.cn/asa/)
* 后台架构基于python-django, 前端架构基于requirejs&angularjs
* 易于部署和功能拓展弹幕视频站
* 支持文件断点上传
* REST
* 欢迎加入



==================================
#### 依赖项
* 后台 python==3.4.3+(python2.7.9+), python-django==1.7.1+, django-grappelli==2.6.3+, Pillow==2.7.0+, django-guardian=1.2.5+, six=1.9.0+
* 前端 见src/app/bower.json

安装
==================================
安装python依赖项

首先安装python

ubuntu下

> apt-get install python

mac下

> brew install python 

然后
> pip install django django-grappelli Pillow django-guardian six

> git clone https://github.com/voidrank/ASA.tv.git

> cd ASA.tv/src/app

> bower install

> cd ..

> python manage.py makemigrations website video_cms

> python manage.py migrate

> python manage.py createsuperuser

接下来输入你的superuser的注册信息。
创建超级用户成功，输入下面代码使得服务器运行。

> python manage.py runserver

在浏览器中访问localhost:8000/



======
#### 关于修改urlPrefix
1.  src/ASA/settings.py中的PREFIX_URL变量
2.  src/app/main.js中的urlPrefix变量
3.  给src/app/guide.html中的script标签的src和data-main属性添加urlPrefix


======
#### 后台django api的url

##### streaming response
* */api/resource/:token* GET 返回stream型的response。简而言之

    > &lt;video src='*/api/resource/:token'/&gt;
    
    
	就可以播放相应的视频。目前只支持最先版本Chrome浏览器。在实际部署中，请直接使用nginx等静态服务器替代。

##### video

* */api/video/cover/:rec* GET 返回对应rec号的封面二进制文件。
   > &lt;img src='/api/video/cover/:rec'&gt;  
   > &lt;div style="background-image: url('*/api/video/cover/:rec*')"&gt;
   
   就可以显示对应的图片了
   

* */api/video/cover/myupload* GET 返回一个array, 格式如下:
	> [{'rec': number, 'filename': string, 'playCount': number, 'col': string}, ...]
  
  
* */api/video/recToToken/:rec* GET 返回对应rec视频文件的token



* */api/video/search/:filename* GET 搜索名字里面含有:filename的文件，返回一个array
	> [{'rec': number, 'filename': string, 'playCount': number, 'col': string]
	
	(支持中文)
	
	
##### upload url 
* Current upload tool will be moved(frontend&backend) if I have more spare time. And I will use jquery-file-upload && django-chunked-upload(s) as new upload tool.


##### collection 分组
* more about ASA.tv permission system [ASA权限系统](https://github.com/voidrank/ASA.tv/blob/develop/doc/permission/README.md)

* */api/collection/is_member_of* GET 询问当前用户是哪几个组的member, 返回一个array
	> [{'name': string}, {'name': string}, ...]
	
* */api/collection/is_admin_of* GET 询问当前用户是哪几个组的admin，返回一个array，格式同上


* */api/collection/is_root_of* GET 询问当前用户是哪几个组的root，返回一个array，格式同上

* */api/collection/offshow/:token* POST 让:token文件在强文件权限模式下不能显示(ASA_WITH_STRICT_VIDEO_AUTH)

* */api/collection/onshow/:token* POST 让:token文件在强文件权限模式下可以显示


* */api/collection/add/root/:collection/:username* POST 让:username成为:collection的root
* */api/collection/add/admin/:collection/:username* POST
* */api/collection/add/member/:collection/:username* POST
* */api/collection/remove/root/:collection/:username* POST
* */api/collection/remove/admin/:collection/:username* POST
* */api/collection/remove/member/:collection/:username* POST

* */api/collection/video/:collection/:op* GET op为起始位置，返回collection下的视频(offshow的视频可见，需要group_admin权限). 返回格式同*/api/video/cover/myupload*
	(中文支持)

* */api/collection/public/* GET 返回所有collection的信息, 格式为
	> [{'name': string}, {'name', string}, ...]

##### danmaku 弹幕

* */api/danmaku/:token* GET 返回:token视频文件的所有弹幕, 返回一个array，返回格式
 > [{'owner': string, 'stime': string, 'text': string, 'size': number, 'color': string, 'date': number}, ...]
 
* */api/danmaku/:token* POST 发送弹幕. 格式:
 > {'token': string, 'date': number, 'mode': number, 'stime': number, 'text': string, 'color': string, 'size': number}
 
	如果想了解弹幕播放器更详尽的信息，请参见[ABPlayerHTML5项目](https://github.com/jabbany/ABPlayerHTML5) 
	
##### other
* */api/index* 首页显示。还可能会修改，暂时不写文档。

# TODO
===============================

1. Remove video_cms & jquery-file-upload&& django-chunked upload
2. Fix bug: user can't post danmaku
3. Fix bug: player page progress does not display
4. LICENSE: FreeBSD
5. With django-rest-framework(In consideration). See the [idea](http://blog.kevinastone.com/getting-started-with-django-rest-framework-and-angularjs.html)


# LICENSE
===============================
FREEBSD

