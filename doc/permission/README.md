I# Group  
group_name (ListField)  
parent_name (Group) 

=======================================
# FilePermission
#### (以下皆为排除了superuser): 

 
1. 只有Uploader才可删除自己的上传  
2. 所属group有拉下架的权利(无法上架)
3. 只有审核组才可把视频上架

=====================================

# Collection
Subclass of Group (with django-guardian)  

1. user with the permission 'group_member' of collection A can upload video to A.  
有分类A的'group_member'权限的user可以给这个分类上传视频。
 
2. user with the permission 'group_admin' of collection A can add/remove 'group_member' permission of other user in A. This permission can also let some video become not onshow.  
有分类A的'group_admin'权限的user可以给这个分类添加和删除其他用户的'group_member'权限.同时可以让该分类的视频下架.
 
3. user with the permission 'group_root' of collection A can add/remove 'group_admin' permission of other user in A.  
有分类A的'group_root'权限的user可以给这个分类添加和删除其他用户的'group_admin'权限。

======================================
# SuperUser拥有所有权限