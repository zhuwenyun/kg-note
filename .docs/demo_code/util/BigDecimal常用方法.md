## 快速体验
```java
BigDecimal b1 = new BigDecimal("12.345");
// 针对小数的第3位按照四舍五入处理
BigDecimal b2 = b1.setScale(2, RoundingMode.HALF_UP);
// 此时是 12.35
System.out.println(b2);
// 返回的是整数部分与精度无关
System.out.println(b2.intValue());
```

## 创建
```java
// 调用构造函数
public BigDecimal(String val)
public BigDecimal(double val)
public BigDecimal(BigInteger val)
public BigDecimal(int val)
public BigDecimal(long val)
// 调用静态方法
static BigDecimal valueOf(long val)
static BigDecimal valueOf(double val)


```
::: danger
凡是带有double的入参的API都是不推荐，原因是可能已丢失精度，再用无意义！！！
:::

## 取值

```java
//取整数部分
public long longValue()
public int intValue()
//整数和小数部分
public float floatValue()
public double doubleValue()

```



## 加减乘除
```java
add

subtract

multiply
        BigDecimal ans = num1.multiply(num2).setScale(2, BigDecimal.ROUND_HALF_UP);


divide
        BigDecimal ans = num1.divide(num2, 2, BigDecimal.ROUND_HALF_UP);

remainder

negate
```


## 比较大小
```java

```

## 精度设置
设置精度即设置几位小数。

```java
public BigDecimal setScale(int newScale)
public BigDecimal setScale(int newScale, RoundingMode roundingMode)
```


## 舍入模式RoundingMode
```java
(1) RoundingMode UP : 舍入模式从零开始;始终在非零丢弃分数之前增加数字  (正数"变大"，负数"变小")
                如:  5.5 -> 6.0    -5.5 -> -6
                    
(2) RoundingMode DOWN : 舍入模式向零舍入; 不要在丢弃的分数之前递增数字（即截断）    (正数"变小"，负数"变大")
                如:  5.5 -> 5    -5.5 -> -5   
                    
(3) RoundingMode CEILING : 圆形模式向正无穷大转弯; 
        如果结果为正，则表现为RoundingMode.UP ; 如果为负，表现为RoundingMode.DOWN   ("全部变大")
                    
                如: 5.5 -> 6          -5.5 -> -5
                    
(4) RoundingMode FLOOR :舍入模式向负无穷大转弯;
        如果结果为正，则表现为RoundingMode.DOWN ; 如果为负，表现为RoundingMode.UP   ("全部变小")
            
            如:  5.5 -> 5          -5.5 -> -6
                
(5) RoundingMode HALF_UP : 四舍五入模式向"最近邻居"转弯，除非两个邻居都是等距的，在这种情况下是圆括弧的 
        如果丢弃的分数为RoundingMode.UP则表示为RoundingMode.UP ; 否则，表现为RoundingMode.DOWN    ("四舍五入")                                       
            如: 5.5 -> 6           -2.5 -> -3

(6) RoundingMode HALF_DOWN : 四舍五入模式向"最近邻居"转弯，除非这两个邻居都是等距离的，在这种情况下，这是倒圆的 
        如果丢弃的分数> 0.5，则表示为RoundingMode.UP ; 否则，表现为RoundingMode.DOWN       ("五舍六入")
            
            如: 5.5 -> 5           -5.5  -> -5
                
(7) RoundingMode HALF_EVEN : "银行家四舍五入"
                    (目标是偶数，可以使用四舍五入，也可以适用五舍六入，具体看哪边更接近一个偶数)      
                
            如:  5.5 -> 6         -2.5 -> -2    -5.5 -> -6
                
(8) RoundingMode UNNECESSARY :舍入模式来确定所请求的操作具有精确的结果，因此不需要舍入 
            如果在产生不精确结果的操作上指定了舍入模式，则抛出ArithmeticException          
            
        (需要舍掉的位数不是0,就报异常 "ArithmeticException" ; 如果需要舍掉的位数是0,就返回已结舍掉的正常结果)
```

