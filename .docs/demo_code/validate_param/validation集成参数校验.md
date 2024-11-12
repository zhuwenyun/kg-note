
## 简介
jsr（java specification requests java规范请求）
jcp（java community process）这个组织，将提议加到 jsr 这个规范中。
Bean Validation
bean validation 为java bean验证定义了相应的元数据模型和api。
下面是每次提议与标准API定义的关系
jsr303,bean validation1.0
jsr349,bean validation1.
jsr380,bean validation2.0
标准API定义后，需要有具体的实现，下面是优秀实现与定义关系
bean validation与hibernate validator
bean validation1.0参考实现：hibernate validator4.3.1.final
bean validation1.1参考实现：hibernate validator5.1.final
bean validation2.0参考实现：hibernate validator6.0.1.final
spring validation 与 hibernate validator 是什么关系？
spring validation在hibernate validator的基础上，对其进行了二次封装，以满足在spring环境中更简单，高效的对数据进行验证。


## 快速体验
### 添加依赖
```xml
		<dependency>
			<groupId>javax.validation</groupId>
			<artifactId>validation-api</artifactId>
			<version>2.0.1.Final</version>
		</dependency>
		<dependency>
			<groupId>org.hibernate</groupId>
			<artifactId>hibernate-validator</artifactId>
			<version>6.0.16.Final</version>
		</dependency>
		<dependency>
			<groupId>javax.el</groupId>
			<artifactId>javax.el-api</artifactId>
			<version>3.0.0</version>
		</dependency>
		<dependency>
			<groupId>org.glassfish.web</groupId>
			<artifactId>javax.el</artifactId>
			<version>2.2.6</version>
		</dependency>
```
> 解释说明
> // 验证框架
> javax.validation:validation-api:2.0.1.Final
> org.hibernate:hibernate-validator:6.0.16.Final
> // el表达式如果在web环境下可以不用单独使用因为已经集成
> javax.el:javax.el-api:3.0.0
> org.glassfish.web:javax.el:2.2.6

### 使用Demo
#### 在待校验对象上添加校验规则
```java
// 需要校验的Bean
public class UserInfo {
    @NotNull(message = "userId不能null")
    private Long userId;
    @NotBlank(message = "userName不能为空")
    private String userName;
    @NotEmpty(message = "password不能为空")
    @Length(min = 6, max = 20, message = "密码长度需是6到20位")
    private String password;
    @NotNull(message = "年龄不能为空")
    @Min(value = 18, message = "年龄不能小于18岁")
    @Max(value = 60, message = "年龄不能大于60岁")
    private Integer age;
    @NotNull
    @Email(message = "邮箱格式不正确")
    private String email;
    @NotNull
    @Past(message = "生日只能是过去的时间")
    private Date birthday;
    @NotNull
    @Size(min = 1, message = "好友列表不能为空")
    private List<UserInfo> friends;
}
```

#### 执行校验得到校验结果
```java
// 编写测试类
public class UserInfoTest {

    private Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
    
    @Test
    public void test1(){
        UserInfo userInfo = new UserInfo();
        userInfo.setUserId(1L);
        userInfo.setUserName("zwy");
        userInfo.setPassword("        ");
        userInfo.setAge(20);
        userInfo.setEmail("992@qq.com");
        Calendar calendar = Calendar.getInstance();
        calendar.set(1999,1,1);
        userInfo.setBirthday(calendar.getTime());
        userInfo.setFriends(new ArrayList<>());
        Set<ConstraintViolation<UserInfo>> msgSet = validator.validate(userInfo);
        msgSet.forEach(r-> System.out.println(r.getMessage()));
    }
}
```

#### 使用解释说明
```java
// 创建校验器，通常定义为成员变量
Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
// 准备待校验的Bean
UserInfo userInfo = new UserInfo();
// 执行校验并得到结果
Set<ConstraintViolation<UserInfo>> msgSet = validator.validate(userInfo);
// 处理结果，如果结果集合不为空说明Bean中参数有不合法的取出第一个然后抛出异常参数校验失败即可。
```


## 分组校验
### 须知规则
1、分组后，如果我们在校验上不指定属于哪个分组，此时还会校验吗？
不会校验
Bean上不指定分组，校验的时候不指定分组，会被校验【走默认分组】
Bean上不指定分组，校验的时候指定分组，不会校验
Bean上指定分组，校验的时候不指定分组，不会校验
Bean上指定分组，校验的时候指定分组，会校验【走对应分组】

### 准备校验规则
```java
Bean
带分组的字段校验
@NotBlank(message = "userName不能为空", groups = {ValidGroup.LoginGroup.class, ValidGroup.RegisterGroup.class})
private String userName;
不带分组的字段校验
@NotEmpty(message = "password不能为空")
@Length(min = 6, max = 20, message = "密码长度需是6到20位")
private String password;
```
### 结果分析
#### 情况一
```java
校验不指定具体的分组相当于指定的是默认的Default分组
Set<ConstraintViolation<UserInfo>> msgSet = validator.validate(userInfo);
结论
userName字段不会被校验，因为写了其他组且没默认组。
password字段会被校验，因为什么也不指定的情况下，相当于有默认组，而默认是校验默认组。
```
#### 情况二
```java
校验指定具体的分组
Set<ConstraintViolation<UserInfo>> msgSet = validator.validate(userInfo, ValidGroup.LoginGroup.class);
结论
userName字段会被校验，因为有登录组。
password字段不会被校验，因为只校验登录组。
```

#### 情况三
```java
// 分组校验
class ValidationGroup {
    public interface LoginGroup{} // 登录校验
    public interface RegisterGroup{}// 注册校验
}
// 按照分组的顺序进行校验
@GroupSequence({
	LoginGroup.class, RegisterGroup.class, Default.class
})
public interface OrderGroup{}// 注册校验

// 依次进行分组校验
validator.validate(userInfo, ValidationGroup.OrderGroup.class);
```


### 完整例子
```java
@NotEmpty(message="用户名称不能为空",group=LoginGroup.class)
private String userName;
// 只会校验对应组的校验，其他组不会校验
validator.validate(userInfo, ValidationGroup.LoginGroup.class);
```

## 级联校验
### 校验规则
```java
// 外层对好友数量校验
@NotNull(message = "friends不能为空", groups = {ValidGroup.RegisterGroup.class})
@Size(min = 1, message = "好友列表不能为空", groups = {ValidGroup.RegisterGroup.class})
private List<@Valid UserInfo> friends;
// 内层对 UserInfo 校验，略。
```
### 执行校验
```java
UserInfo userInfo = new UserInfo();
userInfo.setUserName("zwy");
userInfo.setEmail("992@qq.com");
userInfo.setFriends(Arrays.asList(new UserInfo()));
Set<ConstraintViolation<UserInfo>> msgSet = validator.validate(userInfo, ValidGroup.RegisterGroup.class);
级联对象好友列表校验失败
```

## 方法参数、返回值、构造函数校验
### 方法参数校验
```java   
UserInfoService
	// 注解不写，校验不生效
	void setUserInfo(@Valid UserInfo userInfo){}

// 创建验证器
ExecutableValidator executableValidator = validator.forExecutables();
// 1.待验证对象，2.待验证对象的方法，3.方法参数列表 4.分组列表
UserInfoService service = new UserInfoService();
Method method = service.getClass().get("setUserInfo",UserInfo.class);
Object[] params = new Object[]{new UserInfo()};
// 2.校验
Set<ConstraintViolation<UserInfoService>> validateSetResult 
	= executableValidator.validateParameters(service,method,params);
// 3.处理校验结果
```
### 方法返回值校验
```java
// ================= 对象方法的返回值校验 ==============
UserInfoService
	// 注解不写，校验不生效
	@Valid UserInfo getUserInfo(){
    	return new UserInfo();
    }

// 创建验证器
ExecutableValidator executableValidator = validator.forExecutables();
// 1.待验证对象，2.待验证对象的方法，3.方法参数列表 4.分组列表
UserInfoService service = new UserInfoService();
Method method = service.getClass().get("getUserInfo");
Object returnValue = method.invoke(service);
// 2.校验
Set<ConstraintViolation<UserInfoService>> validateSetResult 
	= executableValidator.validateReturnValue(service,method,returnValue);
// 3.处理校验结果
```
### 构造方法参数校验
```java
UserInfoService
	// 注解不写，校验不生效
	public UserInfoService(@Valid UserInfo userInfo){}

// 创建验证器
ExecutableValidator executableValidator = validator.forExecutables();
// 1.待验证对象，2.待验证对象的方法，3.方法参数列表 4.分组列表
Constructor constructor = UserInfoService.class.getConstructor(UserInfo.class);
Object[] params = new Object[]{new UserInfo()};
// 2.校验
Set<ConstraintViolation<UserInfoService>> validateSetResult 
	= executableValidator.validateConstructorParameters(constructor,params);
// 3.处理校验结果
```


## 自定义校验规则
### 定义注解
```java
@Document
@Target(ElementType,FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Phone {
    /** 验证失败提示信息 */
	String message() default "手机号校验错误";
    
    Class<?>[] groups() default {};
    /** 负载程度 */
    Class<? extends Payload>[] payload() default {};
}
```
### 定义校验规则
```java
// 定义校验逻辑（T1定义的注解，T2待校验的参数类型）
public class PhoneValidator implements ConstrainValidator<Phone, String> {
	// value表示传入的值
    public boolean isValid(String value, ContraintValidatorContext context){
    	
        // false表示校验不通过，此时会返回我们的错误信息
        return false;
    }
}
```
### 将注解与校验进行关联
> @Constraint(validatedBy=PhoneValidator.class)
关联后的效果如下：
```java
@Document
@Target(ElementType,FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy=PhoneValidator.class)
public @interface Phone {
    /** 验证失败提示信息 */
	String message() default "手机号校验错误";
    
    Class<?>[] groups() default {};
    /** 负载程度 */
    Class<? extends Payload>[] payload() default {};
}

```