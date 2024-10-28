

## GC overhead limit exceeded

```
在idea中设置：
1、 File -> Settings -> Build,Execution,Deployment -> Complier
设置【Build process heap size(Mbytes)】 为 2000
2、File -> Settings -> Build,Execution,Deployment ->Build Tools -> Maven -> Importing
设置【VM options for importer】为 -Xmx1024m
```