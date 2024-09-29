
重试方式，提供两种
1、编程方式
2、声明方式即注解方式


重试的策略
1、满足什么条件需要重试？
2、重试的次数
3、重试的方式，立即还是、叠加时间


## 重试方式
### 声明方式
```java
@Configuration
@EnableRetry
public class RetryConfig {
    // 这里可以配置重试策略等，但使用@Retryable注解时，默认策略通常就足够了
}

@Service
public class MyService {
    @Retryable(
        value = {SpecificException.class},
        maxAttempts = 5,
        backoff = @Backoff(delay = 2000, multiplier = 2, maxDelay = 10000)
    )
    public void myMethod() throws SpecificException {
        // 这里是可能会抛出SpecificException的方法体
    }
}
```
::: danger
@Retryable是Spring Retry模块提供的一个注解，用于实现方法级别的重试机制‌。以下是@Retryable注解的所有选项：
‌value‌：指定需要重试的异常类型，默认为Throwable，即所有异常都会触发重试。
‌include‌：除了value指定的异常外，还可以包括哪些异常进行重试。
‌exclude‌：排除哪些异常，即使它们匹配了value或include配置。
‌maxAttempts‌：指定最大重试次数，默认为3次。
‌backoff‌：指定重试的退避策略，可以设置初始延迟和延迟倍数。
‌retryExceptions‌：直接指定需要重试的异常列表，可以替代value。
使用@Retryable注解时，需要在Spring Boot启动类上添加@EnableRetry注解来使能重试机制‌
:::


### 编程方式
```java
public class RetryExecutorFactory {
    private static final RetryTemplate RETRY_TEMPLATE = new RetryTemplate();

    private int attempts = 3;
    RETRY_TEMPLATE.setRetryPolicy(new SimpleRetryPolicy(attempts));
    ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
    backOffPolicy.setInitialInterval(initialInterval);
    backOffPolicy.setMultiplier(multiplier);
    RETRY_TEMPLATE.setBackOffPolicy(backOffPolicy);
}
```

## RetryTemplate

#### 重试策略
```java
SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy(attempts);
retryPolicy.setMaxAttempts(3);
maxAttempts最大重试次数，默认3次
```

#### 回退策略
```java
ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
backOffPolicy.setInitialInterval(initialInterval);
backOffPolicy.setMultiplier(multiplier);
backOffPolicy.setMaxInterval(20000);
initialInterval初始间隔，默认100毫秒
Multiplier乘数，默认2
maxInterval最大间隔，默认30000毫秒即30秒
100
100 * 2
100 * 2 * 2
```
::: danger
ExponentialBackOffPolicy 是一种常用于重试机制的策略，特别是在网络请求或数据库操作中遇到暂时性问题时。该策略通过逐渐增加重试之间的等待时间来处理失败的操作，这样可以减少因连续快速重试而导致的系统过载。

ExponentialBackOffPolicy 的主要参数通常包括：

‌初始间隔（Initial Interval）‌：

重试之间的初始等待时间。这是第一次重试之前的等待时间。
‌最大间隔（Max Interval）‌：

重试之间的最大等待时间。无论重试次数如何，等待时间都不会超过这个值。
‌乘数（Multiplier）‌：

用于计算后续重试间隔的乘数。每次重试后，间隔都会乘以这个值，直到达到最大间隔。
‌最大重试次数（Max Retries）‌：

在放弃之前，允许的最大重试次数。
例如，如果一个操作的初始间隔是1秒，乘数是2，最大间隔是10秒，最大重试次数是5，那么重试间隔将如下：

第1次重试：1秒
第2次重试：2秒（1秒 * 2）
第3次重试：4秒（2秒 * 2）
第4次重试：8秒（4秒 * 2），但因为最大间隔是10秒，所以这里不会继续增加。
第5次重试：10秒（保持最大间隔）
使用 ExponentialBackOffPolicy 可以有效地处理暂时性问题，同时减少对系统的压力。
:::




ForbidDTO forbidDTO = driveOutConfigManage.getForbidDTOS(forbidSwitchConfig, forbidName);
driveOutAction.setForbidLevel(forbidDTO.getForbidLevel());
forbidtList[i].forbidLevel

{
    "?switchFlag": "出车拦截总开关 0-关闭 1-打开",
    "switchFlag": 1,
    "?forbidtList": "出车拦截子类型",
    "forbidtList": [
        {
            "?forbidType": "拦截类型-业务考试拦截",
            "forbidType": "businessExam",
            "?forbidSwitch": "子类型拦截开关 0-关闭 1-打开,总类型打开 ，子类型关闭，该子类型的拦截关闭",
            "forbidSwitch": 0,
            "?forbidLevel": "拦截拦截优先级 最大值优先拦截",
            "forbidLevel": 200,
            "?tenantIds": "租户白名单,在租户列表中的租户不进行拦截校验",
            "tenantIds": [
                800905,
                800799,
                800207,
                800825,
                800214,
                800212,
                800013,
                800007,
                800308,
                800176]
        },
	  {
            "?forbidType": "健康确认检查出车拦截",
            "forbidType": "healthConfirmationCheckIntercept",
            "?forbidSwitch": "子类型拦截开关 0-关闭 1-打开,总类型打开 ，子类型关闭，该子类型的拦截关闭",
            "forbidSwitch": 1,
            "?forbidLevel": "拦截优先级 最大值优先拦截",
            "forbidLevel": 800,
            "?tenantIds": "租户白名单,在租户列表中的租户不进行拦截校验",
            "tenantIds": []
        }
    ]
}