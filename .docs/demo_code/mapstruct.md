
## 使用步骤

### 定义接口
```java
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UserConvertor {

    UserConvertor INSTANCE = Mappers.getMapper(UserConvertor.class);

    //忽略参数映射
    @Mapping(target = "tenantIds", ignore = true)
    //添加自定义映射
    @Mapping(target = "updateTime2", source = "updateTime")
    //将字符串解析成Date
    @Mapping(target = "dateString", source = "date", dateFormat = "dd-MM-yyyy HH:mm:ss")
    //将Date映射成字符串
    @Mapping(target = "date", source = "dateString", dateFormat = "dd-MM-yyyy HH:mm:ss")
    //调用自定义或静态方法完成自定义逻辑
    @Mapping(target = "operatorInfo",
            expression = "java(createTestInfo(testDTO.getOperatorId(), testDTO.getOperatorName()))")
    //默认会映射字段名称和类型都一致的映射
    UserVO doToVo(UserDO userDO);
    
    //定义默认方法供表达式使用
    //此写法非常灵活，可以自定义各种业务映射逻辑
    default String createTestInfo(String operatorId, String operatorName) {
        if (operatorId == null) {operatorId = "";}
        if (operatorName == null) {operatorName = "";}
        return operatorName + " + " + operatorId;
    }

    //集合映射会调用上面的单个对象映射
    List<UserVO> userDOListToVOList(List<UserDO> userDOList);
}
```

### json的处理
定义一个工具类，封装工具类，然后通过
@Mapper(imports = { MyUtils.class })
结合表达式实现
expression = "java(MyJsonUtils.toObject(person.getFriend(),PersonVo.class))"
expression = "java(MyJsonUtils.toJson(personVo.getFriend()))"

```java
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(imports = MyJsonUtils.class)
public interface JsonTestMapper {
    JsonTestMapper INSTANCE = Mappers.getMapper(JsonTestMapper.class);

    @Mapping(target = "friend",
            expression = "java(MyJsonUtils.toObject(person.getFriend(),PersonVo.class))")
    PersonVo doToVo(Person person);

    @Mapping(target = "friend",
            expression = "java(MyJsonUtils.toJson(personVo.getFriend()))")
    Person voToDo(PersonVo personVo);
}

泛型如何解决？
表达式的方式可以支持就是有点长而已
```
```java
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.io.IOException;
import java.text.SimpleDateFormat;

public class MyJsonUtils {
    private static ObjectMapper mapper = initMapperConfig(new ObjectMapper());
    
    public static String toJson(Object obj) {
        try {
            return mapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    public static <T> T toObject(String json, Class<T> clazz) {
        JavaType javaType = mapper.getTypeFactory().constructType(clazz);
        try {
            return mapper.readValue(json, javaType);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static ObjectMapper initMapperConfig(ObjectMapper objectMapper) {
        String dateTimeFormat = "yyyy-MM-dd HH:mm:ss";
        objectMapper.setDateFormat(new SimpleDateFormat(dateTimeFormat));
        // 配置序列化级别
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        // 配置JSON缩进支持
        objectMapper.configure(SerializationFeature.INDENT_OUTPUT, false);
        // 允许单个数值当做数组处理
        objectMapper.enable(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY);
        // 禁止重复键, 抛出异常
        objectMapper.enable(DeserializationFeature.FAIL_ON_READING_DUP_TREE_KEY);
        // 禁止使用int代表Enum的order()來反序列化Enum, 抛出异常
        objectMapper.enable(DeserializationFeature.FAIL_ON_NUMBERS_FOR_ENUMS);
        // 有属性不能映射的时候不报错
        objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        // 对象为空时不抛异常
        objectMapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        // 时间格式
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        // 允许未知字段
        objectMapper.enable(JsonGenerator.Feature.IGNORE_UNKNOWN);
        // 序列化BigDecimal时之间输出原始数字还是科学计数, 默认false, 即是否以toPlainString()科学计数方式来输出
        objectMapper.enable(JsonGenerator.Feature.WRITE_BIGDECIMAL_AS_PLAIN);
        return objectMapper;
    }
}
```

## 后映射
::: danger
1、如何将方法标记为后映射方法。
被 `@AfterMapping` 注解标注的默认方法会被识别为后映射方法。

2、何时被调用？
方法的入参包括了后映射方法入参数（全部包含），会被认为匹配上了
任何一个匹配上的后映射方法，都会在映射方法的最后一步完成调用！！！

注意⚠️
1、所有匹配的都会被调用，可能会有隐患
:::

```java
@AfterMapping
default void postProcess(UserVO userVO) {
    userVO.setGmtCreate(new Date());
    userVO.setGmtModified(new Date());
}
```
