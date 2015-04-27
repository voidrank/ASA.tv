I# ASA.tv
=============================
#### ASA.tv 计划
* 开源项目
* 示例: [复旦大学学生网视频站](http://stu.fudan.edu.cn/asa/)
* 后台架构基于python-django(计划转移到tornado上), 前端架构基于requirejs&angularjs
* 易于部署和功能拓展弹幕视频站
* 支持文件断点上传
* 欢迎加入


==================================
#### 依赖项
* 后台 python==3.4.3+(python2.7.9+), python-django==1.7.1+, django-grappelli==2.6.3+, Pillow==2.7.0+
* 前端 见src/app/bower.json


======
#### 关于修改urlPrefix
1.  src/ASA/settings.py中的PREFIX_URL变量
2.  src/app/main.js中的urlPrefix变量
3.  给src/app/guide.html中的script标签的src和data-main属性添加urlPrefix


