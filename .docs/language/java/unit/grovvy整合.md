
## Groovy引入

```xml
<dependency>
    <groupId>org.codehaus.groovy</groupId>
    <artifactId>groovy-all</artifactId>
    <version>2.4.7</version>
    <scope>test</scope>
</dependency>
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
def person = new Person(
    name: ‘Tom’, 
    age: 25
)

def person = new Person(
    "name": ‘Tom’, 
    "age": 25
)
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
list.each { item -> println item }
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
在Groovy中，闭包是一个可以引用其自身范围之外的变量的代码块。
简单理解为匿名函数接口的实现对象。
闭包的基本语法如下：
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
