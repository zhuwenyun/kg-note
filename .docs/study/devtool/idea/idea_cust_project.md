
## 配置Tomcat

```
brew install tomcat@8

Edit Configurations -> + -> Tomcat Server[Local]
Application Server -> Configure -> /usr/local/Cellar/tomcat@8/8.5.100/libexec
conf的上级目录即是Tomcat的Home
Before Launch[发布之前需要做的任务]
[ ] build war
[X] build war exploded
选择 build war exploded 这种方式发布到Tomcat
```
war模式
将WEB工程以包的形式上传到服务器;
war模式这种可以称之为是发布模式，这是先打成war包，再发布。
war exploded模式
war exploded模式将WEB工程以当前文件夹的位置关系上传到服务器
war exploded模式是直接把文件夹、jsp页面 、classes等等移到Tomcat 部署文件夹里面，进行加载部署。因此这种方式支持热部署，一般在开发的时候也是用这种方式。