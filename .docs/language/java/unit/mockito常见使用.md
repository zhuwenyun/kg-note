
## 简介
springboot版本与mockito的关系
springboot 1.5.8.RELEASE
    mockito-core 1.10.19
springboot 2.6.13
    mockito-core 4.0.0
    mockito-junit-jupiter 4.0.0

MockitoJUnitRunner 在 mockito-core 的 2.1.0 开始支持
MockitoSettings 由于mockito-junit-jupiter提供，主要junit5使用。
所以在低版本的SpringBoot中只需引入 mockito-core 以及 mockito-inline 完全够用。

### 添加依赖
Mockito
```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>3.7.7</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-inline</artifactId>
    <version>3.7.7</version>
    <scope>test</scope>
</dependency>
<!-- 可选不是那么重要 -->
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <version>3.7.7</version>
    <scope>test</scope>
</dependency>
```
Junit4
```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13.2</version>
    <scope>test</scope>
</dependency>
```
如果是在 springboot 环境中，会自动复合 Junit4 + Mockito
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

## 测试模版

```java
import static org.mockito.Mockito.*;

//@RunWith(MockitoJUnitRunner.class)
@RunWith(MockitoJUnitRunner.StrictStubs.class)
public class MyTest {
    //使用被Mock对象的对象
    @InjectMocks
    MyController myController;
    //被Mock的对象
    @Mock
    MyService myService;

    @Before
    public void before() {
        when(myService.create(any()))
            .thenReturn(true)
            .thenThrow(new TaskException(ServiceCodeEnum.PARAM_INVALID))
            .thenThrow(new IllegalStateException());

        doNothing().when(myService).taskNotNeedDoNotifyGD(any());
    }

    @Test
    public void testMethod(){
      try {
          // do something
      }catch (Exception e){
          e.printStackTrace();
      }
    }
}
```

## 静态与私有方法
### 私有方法
```java
//私有属性
ReflectionTestUtils.setField(obj, "jumpUrl", "forwardUrl");
//私有方法
ReflectionTestUtils.invokeMethod(obj, "testMethod", "param1");
```


### 静态方法
```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-inline</artifactId>
    <version>3.7.7</version>
    <scope>test</scope>
</dependency>
```
```groovy
import static org.mockito.Mockito.*;

mockStatic(MyUtils.class);
when(MyUtils.hello(any())).thenReturn("world");
print(MyUtils.hello("111"))
when(MyUtils.hello(any())).thenReturn("world2");
print(MyUtils.hello("111"))
```
