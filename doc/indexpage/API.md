Template  
{{hostname}}/


ajax  

利用cms的命令行系统

ils arg0 arg1 ...

实际路径为'/public/' + arg0 + '/' + arg1

option:

--sort=attrib attrib是一个字符串，可以有的选项是:
	1. rec，按照rec排序 (升序)
	2. time，按照上传时间排序 (升序)
	3. cc, (click count), 按照 (升序)
	
-r 当指定了--sort才会生效, 返回逆序排序后的结果  


--op=a 显示从a开始的文件，默认a=0
--ct=b 显示ct个文件，默认10,最大为20

response
json:

[
	[filename0, rec0]
	[filename1, rec1]
	[filename2, rec2]
	...
]
