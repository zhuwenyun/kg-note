






com.yueyue.task.core.service.generator.TaskGenerateFacade@2c6ee031
TaskGenerateFacade$$EnhancerBySpringCGLIB$$1@21091


java.lang.String cannot be cast to java.util.List
java.util.ArrayList cannot be cast to java.util.Set
Cannot cast 'java.util.LinkedHashMap' to 'com.yueyue.task.core.service.template.model.UploadConfigDetail$TimeDuration'



block.extInfo Map

[
    ["0",200,1,"视频","视频",[0,1],{"min":5,"max":20}],
    ["1",100,0,"图片","图片",[0,1],null]
]


select id, union_id, tenant_id, driver_id, driver_name, adcode, city, plate_no, source, source_task_id, task_name, task_intro, task_desc, task_type_code, task_sub_type_code, task_start_time, task_end_time, task_status, award_info, punish_info, channel_award_info, channel_punish_info, task_detail_list, gmt_create, gmt_modified, version, template_id, cancel_reason, is_show,expire_time, punish_status from driver_task_0000 WHERE driver_id = 69586412096 and task_status !=400  order by id desc limit 1 
