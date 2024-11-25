
## 根目录下不能创建目录问题
现象
```
常见错误1， 直接创建目录
mkdir -p /data
mkdir: /data: Read-only file system
 
常见错误2。 进入安全模式，关闭authenticated-root和SIP后，重新挂载根分区
sudo mount -uw /
mount_apfs: volume could not be mounted: Permission denied
mount: / failed with 66
```
### mac的版本 11.0 和以前版本
```bash
csrutil status
第一步：关机重启Mac
Intel芯：按下开机键，长按住command+R键，直到出现进度条，代表此时已进入恢复模式。
Apple芯：Mac 关机时按住电源按钮（10 秒）。
然后转到 “选项”。您可能需要管理员密码。
第二步：恢复模式下打开终端
输入解锁密码后，在左上角点击 实用工具 => 点击终端
csrutil disable
第三步：重新挂载
sudo mount -uw /
```
### mac的版本 11.0 以后版本
```bash
# 创建可用目录（不在根目录下），如
mkdir -p ~/home

# 增加关联
sudo vi /etc/synthetic.conf 
# 内容：注意，这里data前面没有/； 并且data与后面内容使用tab分割
home	/Users/bailongma/home

# 重启系统
sudo reboot

# 重启后，系统会在根目录/下创建data目录，如下：（这里是一种软连接方式）
(base) [11:16:35] [~] ❱❱❱ ll /home
lrwxr-xr-x  1 root  wheel    21B 11  5 11:10 /home -> /Users/bailongma/home
[11:16:38] [cost 0.024s] ll /home
```