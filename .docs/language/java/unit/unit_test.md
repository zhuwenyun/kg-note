

## 环境搭建
### 引入依赖包
Junit4
```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13.2</version>
    <scope>test</scope>
</dependency>
```
Mockito
```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>3.12.4</version>
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

附加包 lombok
```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.16.10</version>
</dependency>
```


## Mockito

### 测试模版

```java
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
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

    




```java
@RunWith(MockitoJUnitRunner.class)

    @Before
    public void setUp() {
        ReflectionTestUtils.setField(auditDriverTaskInterceptServiceImplUnderTest, "jumpUrl", "forwardUrl");
    }

```





