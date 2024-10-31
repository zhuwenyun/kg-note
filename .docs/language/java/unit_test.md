

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
Groovy
```xml
<dependency>
    <groupId>org.codehaus.groovy</groupId>
    <artifactId>groovy-all</artifactId>
    <version>2.4.7</version>
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

附加包 jackson
导入依赖：jackson-databind 内部依赖了 jackson-annotations 与 jackson-core，所以 Maven 应用时，只要导入 databind 一个，则同时也导入了 annotations 与 core 依赖。
```xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>2.11.0</version>
</dependency>
```

#### 字符串反序列化成对象
```
ObjectMapper objectMapper = new ObjectMapper();
// 允许JSON中的字段多于相应的Java对象中的字段
objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
// 配置ObjectMapper保留null字段
objectMapper.configure(SerializationFeature.WRITE_NULL_MAP_VALUES, true);
```

```java
ObjectMapper objectMapper = new ObjectMapper();
String carJson = "{ \"brand\" : \"Mercedes\", \"doors\" : 6 }";
Car car = objectMapper.readValue(carJson, Car.class);

String jsonArray = "[{\"brand\":\"ford\"}, {\"brand\":\"Fiat\"}]";
ObjectMapper objectMapper = new ObjectMapper();
Car[] cars2 = objectMapper.readValue(jsonArray, Car[].class);

String jsonArray = "[{\"brand\":\"ford\"}, {\"brand\":\"Fiat\"}]";
ObjectMapper objectMapper = new ObjectMapper();
List<Car> cars = objectMapper.readValue(jsonArray, new TypeReference<List<Car>>(){});

String jsonObject = "{\"brand\":\"ford\", \"doors\":5}";
ObjectMapper objectMapper = new ObjectMapper();
Map<String, Object> jsonMap = objectMapper.readValue(jsonObject,new TypeReference<Map<String,Object>>(){});
```


#### 对象序列化成字符串
```java
ObjectMapper objectMapper = new ObjectMapper();
String json = objectMapper.writeValueAsString(car);

```


## 序列化json时保留对象的null字段
### jackson
```java
ObjectMapper mapper = new ObjectMapper();
// 配置ObjectMapper保留null字段
mapper.configure(SerializationFeature.WRITE_NULL_MAP_VALUES, true);
// 序列化对象
String json = mapper.writeValueAsString(obj);
System.out.println(json); // 输出可能包含null字段
```
### fastjson
```java
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.serializer.SerializerFeature;

String jsonString = JSON.toJSONString(exampleObject, SerializerFeature.WriteMapNullValue);
System.out.println(jsonString);
```


## Groovy常用语法

### 常见对象创建
#### Map
```groovy
def map1 = [key1: 'value1', key2: 'value2']
```

#### List
```groovy
// 创建一个空的列表
def emptyList = []
// 创建一个包含元素的列表
def numbers = [1, 2, 3, 4, 5]
// 创建一个包含不同类型元素的列表
def mixedList = ['a', 1, true]
// 创建一个包含重复元素的列表
def duplicates = [1, 2, 2, 3, 3, 3]
// 使用范围创建一个数字列表
def rangeList = 0..5
// 创建一个包含其他列表的列表
def listOfLists = [[1, 2], [3, 4], [5, 6]]
```

#### Set
```groovy
// 使用[]直接创建Set
def set1 = [] as Set
// 使用[]初始化并填充Set
def set2 = [1, 2, 3, 4, 5] as Set
// 直接创建并初始化Set
def set3 = [1, 2, 3] as Set
```

#### 自定义对象
``` groovy
class Person {
    String name
    int age
}
def person = new Person(name: ‘Tom’, age: 25)
```

### 常用API
#### Map
```groovy
//创建Map：
def map = [‘key1’: ‘value1’, ‘key2’: ‘value2’]
//获取Map中的值：
def value1 = map[‘key1’]
def value2 = map.key2
//修改Map中的值：
map[‘key1’] = ‘newValue1’
map.key2 = ‘newValue2’
//遍历Map：
map.each { key, value ->
println “$key: $value”
}
//判断Map是否包含某个键：
if (‘key1’ in map) {
println “Map contains key1”
}
//删除Map中的键值对：
map.remove(‘key1’)
//获取Map的键集合和值集合：
def keys = map.keySet()
def values = map.values()
```

#### Map
```groovy
//创建List：
def list = [1, 2, 3, 4, 5]
//获取List中的元素：
def firstItem = list[0]
//修改List中的元素：
list[0] = 10
//遍历List：
list.each { item ->
println item
}
//判断List是否包含某个元素：
if (1 in list) {
println “List contains 1”
}
//添加元素到List：
list << 6
//删除List中的元素：
list.remove(0) // 删除索引为0的元素
//获取List的长度：
def size = list.size()
```

#### Map
```groovy
//基本和List一致，下面操作不同
//创建Set：
def set = [1, 2, 3, 4, 5] as Set
//删除Set中的元素：
set.remove(1)
```

### 高级写法

#### 闭包
在Groovy中，闭包是一个可以引用其自身范围之外的变量的代码块。闭包的基本语法如下：
{ [参数列表] -> [代码块] }
```java
//无参数的闭包：
def sayHello = { -> println “Hello, World!” }
sayHello()
//带参数的闭包：
def sayHello = { name -> println “Hello, $name!” }
sayHello(“Groovy”)
//闭包作为函数参数：
def names = [“Alice”, “Bob”, “Charlie”]
names.each { name -> println name }
```

#### 方法调用简写
```groovy
// 调用打印方法
println item
println(item)
// 调用集合的each方法
collection.each { name -> println name }
collection.each({ name -> println name })
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





