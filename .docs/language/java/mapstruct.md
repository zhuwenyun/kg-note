
## 准备工作
mapstruct



```java
@Data
public class UserDO {
    private Integer id;
    private String name;
    private String createTime;
    private LocalDateTime updateTime;
}
@Data
public class UserVO {
    private Integer id;
    private String name;
    private String createTime;
    private LocalDateTime updateTime2;

    private String extraName2;
}
```


## 默认映射
::: danger
什么也不用做，自动实现映射逻辑。  
注意：  
1、字段类型要一致
2、字段名称要一致

集合默认与对象默认映射的区别？
1、集合上添加 @Mapping(target = "t_id", source = "s_id") 不会生效，对象上添加会生效
:::

### 对象默认映射


## 集合默认映射

```java
@Mapper
public interface UserConvertor {
    List<UserVO> userDOListToVOList(List<UserDO> userDOList);
}
```


## 自定义映射

### 字段名称不同的映射
```java
@Mapper
public interface UserConvertor {
    @Mapping(target = "updateTime2", source = "updateTime")
    UserVO userDOToVO(UserDO userDO);
}
```

### 其他字段的映射追加映射
```java
@Mapper
public interface UserConvertor {
    @Mapping(target = "createTime", source = "extraName")
    UserVO userDOToVO(UserDO userDO, String extraName);
}
```

### 日期处理
```java
    @Mapping(target = "dateString", source = "date", dateFormat = "dd-MM-yyyy HH:mm:ss")

    @Mapping(target = "date", source = "dateString", dateFormat = "dd-MM-yyyy HH:mm:ss")
```

### json字符串反序列化成对象
```java
     @Mappings(value = {
        @Mapping(target = "operatorInfo",
            expression = "java(createOperatorInfo(TestDTO.getOperatorId(), TestDTO.getOperatorName()))")
    })
    TestVO covertMemoVO(TestDTO TestDTO);

    // 自定义拼接operatorInfo的方法
    default String createTestInfo(String operatorId, String operatorName) {
        if (operatorId == null) {operatorId = "";}
        if (operatorName == null) {operatorName = "";}
        return operatorName + " + " + operatorId;
    }
```

### 对象序列化成json字符串
```java
     @Mappings(value = {
        @Mapping(target = "operatorInfo",
            expression = "java(createOperatorInfo(TestDTO.getOperatorId(), TestDTO.getOperatorName()))")
    })
    TestVO covertMemoVO(TestDTO TestDTO);

    // 自定义拼接operatorInfo的方法
    default String createTestInfo(String operatorId, String operatorName) {
        if (operatorId == null) {operatorId = "";}
        if (operatorName == null) {operatorName = "";}
        return operatorName + " + " + operatorId;
    }
```


### 某个字段不映射
```java
@Mapper
public interface UserConvertor {
    @Mapping(target = "updateTime2", ignore = true)
    UserVO userDOToVO(UserDO userDO);
}
```

## 后映射
::: danger
1、如何将方法标记为后映射方法。
被 `@AfterMapping` 注解标注的默认方法会被识别为后映射方法。

2、何时被调用？
方法的入参包括了后映射方法入参数，会被认为匹配上了
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




## 对象与json字符串的相互转化
### 通过 mapping 的 java 表达式实现



### 通过 ObjectFactory 结合 TargetType 实现

```java
Teacher
    String name;
    List<Student> students
Student
    String name;

@Data
public class Student {
   private String name;
}

@Data
public class Teacher {
   private String name;
   private List<Student> students;
}

@Mapper
public class BaseMapper {
	@ObjectFactory
    public <T extends BaseBO> T jsonToObj(String json, @TargetType Class<T> tClass) {
        try {
            T t = tClass.newInstance();
            t.setId(3L);
            return t;
        } catch (Exception e){
            return null;
        }
    }
}


@Mapper(uses = BaseMapper.class)
public interface TestMapper {
    @Mapping(target = "test.id", ignore = true)
    TestSevenBO toBOS(TestFivePO testPO);
}
 
@Component
public class TestMapperImpl implements TestMapper {
 
    @Autowired
    private BaseMapper baseMapper;
 
    @Override
    public void toBOS(TestFivePO testPO, TestSevenBO testSevenBO) {
        if ( testPO == null ) {
            return;
        }
 
        if ( testPO.getTest() != null ) {
            if ( testSevenBO.getTest() == null ) {
                testSevenBO.setTest( baseMapper.createSixBO( TestSixBO.class ) );
            }
            testFourPOToTestSixBO( testPO.getTest(), testSevenBO.getTest() );
        }
        else {
            testSevenBO.setTest( null );
        }
    }
 
    protected void testFourPOToTestSixBO(TestFourPO testFourPO, TestSixBO mappingTarget) {
        if ( testFourPO == null ) {
            return;
        }
 
        mappingTarget.setName( testFourPO.getName() );
        mappingTarget.setCreateTime( testFourPO.getCreateTime() );
    }
}
```