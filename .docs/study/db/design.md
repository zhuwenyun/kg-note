


举个例子，假设我们有两个表：学生表和课程表。学生表中有一个学生ID字段，课程表中有一个课程ID字段。如果我们想要记录每个学生所选的课程，就需要在学生表中添加一个外键，指向课程表中的课程ID字段。这样，我们就可以通过外键来查询每个学生所选的课程信息。
学生表创建一个外键，通过这个外键能查询【每个学生所选的课程信息】。
站在课程角度，是不是一个课程可以被多个学生选择，所以是 1:n 的关系
课程(1):学生(n) 
站在学生角度，是不是一个学生可以拥有多门课程，所以是 1:n 的关系
学生(1):课程(n)


https://www.yuque.com/pdmaner/docs/pdmaner-manual



## drawdb
git clone https://github.com/drawdb-io/drawdb
cd drawdb
npm install
npm run dev



去完成路线失败
/api/v1/learning/roadExam/check

11927836013707







1、构建事件【提供构建工厂，不同事件需要不同的参数】

2、发射事件【校验是否要发射】
设计成责任链模式、全部校验通过才能执行流转

3、消费事件【根据 状态+事件=流转（绑定的有行为）】
设计成策略模式，
任务+什么任务 => 状态机
节点+什么节点 => 状态机
状态机内部结构


leopard-face



发送MQ的审批消息
tag TAG_VOUCHER_ACTION
{"driverId":69162415995,"taskId":1330600,"auditStatus":100,"appealType":300}



1、新下任务时节点的状态

2、上传物料时节点的状态


1、任务完成时间
2、当天完成任务，不再下发任务

1、查看任务详情没有操作记录，需要关注下


todo 更新任务完成时间



落库数据
1、driver_task_voucher_material （/api/v1/voucherTask/submit）写数据是，需要初始化
upload_type
ext_info

/api/v1/voucherTask/getDetail
缺少
upload_type
ext_info


2、driver_task_voucher （/api/v1/voucherTask/setRule
）写数据时，需要初始化 示例信息（done）
ext_info







https://hubble-dev.yueyuechuxing.cn/saasDisposeTask/taskTemplateConfig/detail?templateId=YUEYUE_NEW_259

{"exampleDesc":"示例说明","exampleUrl":"https://cdntest.yueyuechuxing.cn/public/639966c8936d4b4286199b259580f537/7E9E303BB2E3C8E1282B30B89835B142.jpeg","uploadItemConfig":"[[\"0\",200,1,\"视频\",\"视频\",[0,1],{\"min\":5,\"max\":20}],[\"1\",100,0,\"图片\",\"图片\",[0,1],null]]"}

{\"exampleDesc\":\"模版测试\",\"uploadItemConfig\":[{\"materialType\":100,\"requiredType\":1,\"materialTitle\":\"模版测试\",\"materialDesc\":\"模版测试\",\"videoTimeLongLimit\":{\"min\":null,\"max\":null},\"uploadTypeSet\":[0,1]},{\"materialType\":200,\"requiredType\":0,\"uploadTypeSet\":[1],\"videoTimeLongLimit\":{\"min\":5,\"max\":10},\"materialTitle\":\"模版测试模版测试\",\"materialDesc\":\"模版测试模版测试模版测试\"}]}





            MsgSendRequest request = getPushOldRequest(configModel, pushModel);
            List<SendResult> results = messageDispatcher.sendMsgMultiChannel(request, getSendType(configModel));
            

            driver.task.push.config
    

    DriverPushService

            DriverTaskPushModel pushModel = TaskGenerateConvertor.INSTANCE.taskDoToPushModel(taskDO);
            pushModel.setDriverStatus(driverStatus(generateBO));
            pushModel.setIsMoreTask(haveUnfinishedTask(taskDO));
            pushModel.setPushEvent(PushEvent.TASK_GENERATE);
            pushModel.setData(generateBO);
            pushModel.setTaskType(taskDO.getTaskTypeCode());
            pushModel.setTenantId(taskDO.getTenantId());
            driverPushService.push(pushModel);

1、完成单测
2、整体流程测试
下任务 + 消息
审批 + 消息
完成 + 消息
3、sp后台的
