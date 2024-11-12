## 使用步骤
### 添加依赖
SpringMVC
已经集成validated所以无需添加额外依赖。
SpringBoot
已经集成validated所以无需添加额外依赖。
Spring
需要额外集成。

### @Valid和@Validated我们应该选择哪个呢？
SpringMVC、SpringBoot、Spring
只要是Spring环境使用 @Validated 便可以。
如果是自己实现参数校验逻辑，那么用 @Valid


### @Valid 与 @Validated 的关系
@Valid 注解是JSR中定义的Java规范，Hibernate对这个注解进行了实现。
@Validated 注解是Spring提供的，意图是能够让@Valid注解在更多的地方使用并生效。

### 为什么在方法的参数上加上 @Validated 注解就会对参数执行校验？
@Validated 注解本质上就是一个切面，使得在执行非Controller的方法时能够触发对@Valid等注解的验证。



## 使用须知
### 关于字符串类型字段
1、注意要不要组合 @NotNull 问题？
@Length(min = 5, max = 10, message = "长度必须是5到10个字符")
如果传的值不为Null，那么会校验长度是不是在[5,10]，注意包含对空字符串的校验。
如果传的值为Null，那么不会校验直接通过。
结论是：最好都带上 @NotNull

2、不同的传值方式，字符串字段可能接收的不一样
application/x-www-form-urlencoded
string类型的字段，只要带上默认是空字符串
application/json
string类型的字段，带上是空字符串不带上是Null

### 关于整数类型字段
1、注意要不要组合 @NotNull 问题？
Integer/Long
@Min(value = 0, message = "必须大于0")
@Max(value = 10,message = "必须小于10")
@Range(min = 0,max = 1,message = "标识只能是0或1")
如果传值，则校验值是否在范围内
如果不传值，则不校验直接通过。
结论是：最好都带上 @NotNull

2、如果校验ID的范围是否合法如何写呢？
@NotNull
@Range(min = 0, message = "输入的ID无效")(max默认就是最大值)
java最大的long是 2^31-1

### 关于集合类型字段
1、注意要不要组合 @NotNull 问题？
@Size(min = 1, message = "集合至少有一个元素")
如果传值，则校验值是否在范围内
如果不传值（即不带该属性的时候），则不校验直接通过。
结论是：最好都带上 @NotNull

## 参数类型
### 字符串
1.校验字符串的长度，必填，长度最大为10
@NotEmpty
@Length(max = 10,message = "名称的最大长度10")
2.校验字符串的长度，必填，长度介于5到10(包括最大值和最小值)
@NotEmpty
@Length(min=5, max = 10,message = "名称长度介于5到10")
> 备注： @Length与@Size的区别？
> @Length(min=,max=) 检查所属的字段的长度是否在min和max之间,只能用于字符串
> @Size(min=, max=)  检查该字段的size是否在min和max之间，可以是字符串、数组、集合、Map等

### 整数
1.校验整数，必填，只能是0或1
@NotNull
@Range(min = 0,max = 1,message = "标识只能是0或1")
2.校验输入的数字必须是整数且大于0，必填
@NotNull
@Min(value = 1, message = "xx只能是大于0的整数")
3.校验分数的整数位和小数位的长度都不超过2
@NotNull
@Digits(integer = 2, fraction = 2)
4.对Long类型的ID校验，必填，长度不超过20位
@NotNull
@Min(value = 1, message = "输入的ID无效")
5.固定格式的校验 说明的是这种做法并不好，可以采用正则表达的形式校验
@Pattern(regexp = "0[0123]", message = "状态只能为00或01或02或03")

### 集合
@NotNull
@Size(min = 1, message = "集合至少有一个元素")

### 正则校验
1、校验手机号
@NotNull
@Pattern(regexp = "[1][3-9][0-9]{9}", message = "手机号不合法")

