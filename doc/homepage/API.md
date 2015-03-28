----------------------------------------------
register.html

GET {{hostname}}/register/  
response register.html

注册必要信息  
username  
passwd  
email  

放到一个form里头转成json发给服务器  
POST {{hostname}}/register/  
注册成功则返回
{"status":"OK"}

检查username是否重复  
GET {{hostname}}/register/check_id/{{username}}  
response json   
{"status":"OK"}表示该id没有注册   
{"status":"duplicated"}表示该id已被注册



-----------------------------------------------

homepage.html

GET {{hostname}}/homepage/  
response register.html

左边应该有几个按钮:  
基本信息  
高级设定信息  
系统记录信息  
社交信息  
投稿信息  

通过ajax渲染右边内容  

不可修改的基本信息  
GET {{hostname}}/homepage/genericperinfo  
{
	"username": str,
	"email": str
	"avatar": url
}

高级设定信息  
GET {{hostname}}/homepage/advancedperinfo/  
{
	chunksize: int
}

Patch {{hostname}}/homepage/advacedperinfo/  
格式同GET


修改密码   
Patch  {{hostname}}/homepage/passwd/  
{
	oldpasswd: str,
	newpasswd: str
}

投稿信息  
GET {{hostname}}/homepage/myupload/?op=int&ct=int
ct <= 20, ct > 20时自动变成20, 按照rec号排序  
response [ [rec号(int), filename0], [rec号(int), filename1] ... ]  
如果不够的话就返回到最后一个为止

投稿(视频)封面
获得图片  
GET {{hostname}}/video_cover/{{rec}}/  
{{rec}}为视频编号  
上传/修改图片  
POST {{hostname}}/video_cover/{{rec}}/  
{{rec}}为视频编号  
正常response  
{
	"status": "OK"
}


朋友信息  
GET {{hostname}}/homepage/myfriends/?op=0&ed=9  
response [ friendname0, friendname1, ...]

社团信息
GET {{hostname}}/homepage/mygroup/
response [ group0, group1, group2 ...]

获取头像
GET {{hostname}}/homepage/avatar/
修改头像
Patch {{hostname}}/homepage/avatar/?x1= &y1= &x2= &y2= 
x1,y1 indicate the left-top point of cropped area
x2,y2 indicate the right-bottom point of cropped area 
request.body = 二进制图片文件

response  
正常返回 {"status": "OK"}
非正常返回  
 1. status不等于200的    
 2. {"status": "error", "reason": "{{reason}}"}  
    可能的有原因有:
    1. 图片大小超过限定大小(512kb)

=====================================
关于response

非正常返回 
{
	"status": "error",
	"msg": reason
}

正常返回
{
	"status": "OK"
}
