## jackson简介
导入依赖：jackson-databind 内部依赖了 jackson-annotations 与 jackson-core，所以 Maven 应用时，只要导入 databind 一个，则同时也导入了 annotations 与 core 依赖。

```xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>2.11.0</version>
</dependency>
```

## 配合单元测试的方法
```java
ObjectMapper mapper = new ObjectMapper();
mapper.configure(SerializationFeature.WRITE_NULL_MAP_VALUES, true);
String json = mapper.writeValueAsString(new User());
// 输出可能包含null字段
System.out.println(json);
```

## 字符串反序列化成对象
```java
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



