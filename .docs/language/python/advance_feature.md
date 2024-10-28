
## 高级特性

### sort排序
```python
# 对集合中字典排序，排序规则是字典的分数倒序
students = [{'name': 'Alice', 'score': 85}, {'name': 'Bob', 'score': 92}, {'name': 'Charlie', 'score': 78}]
sorted_students = sorted(students, key=lambda student: student['score'], reverse=True)

# 对集合中字典排序，排序规则是先按字典的名字正序，如果名字一样按照分数倒序
students = [{'name': 'Alice', 'score': 85}, {'name': 'Bob', 'score': 92}, {'name': 'Charlie', 'score': 78}]
sorted_students = sorted(students, key=lambda student: (student['name'], -student['score']))
```

### range序列
range(start, stop, step)
start：序列开始的数值，默认为0。
stop：序列结束的数值，不包括此值。
step：步长，默认为1。
```python

```

### lambda匿名函数
Lambda函数的一般语法是“lambda arguments: expression”，‌其中“lambda”是关键字，‌“arguments”是参数列表，‌可以有零个或多个参数，‌多个参数之间用逗号分隔，‌“expression”是函数的表达式，‌描述了函数的返回值。‌
```python
key=lambda student: student['score']
key=lambda student: (student['name'], -student['score'])
```

### sequence切片,可迭代对象的特性
切片操作的基本语法是sequence[start:stop:step]，‌其中sequence是要切片的序列，‌start是切片的起始索引，‌stop是切片的结束索引（‌不包括该索引处的元素）‌，‌step是切片的步长。‌
```python
my_list = sequence()
original_list = [1, 2, 3, 1, 2, 4, 5, 6, 1]
new_list = original_list[:i]
```

### 推导式
集合推导
‌{expression for item in iterable if condition}
{x for x in range(10) if x % 2 == 0}
列表推导
[x for x in range(10) if x % 2 == 0]
字典推导
{键表达式: 值表达式 for 表达式 in 可迭代对象}

```python
# 利用推导表达式快速生成List
# 下面例子对列表去重，效率不高但是写法便捷
# original_list[:i]表示取original_list列表从开始到当前索引i（‌不包括i）‌的所有元素，‌形成一个新的子列表。‌
original_list = [1, 2, 3, 1, 2, 4, 5, 6, 1]
new_list = [item for i, item in enumerate(original_list) if item not in original_list[:i]]
print(new_list)

# 利用推导表达式快速生成Set
set = {5, 1, 3}
new_set = {x for x in set if x > 2}
print(new_set)

# 利用推导表达式快速生成dict
dict_list = [
    {'a': 1}, {'a': 2}, {'a': 3}
]
new_list = [x['a'] for x in dict_list if x['a'] > 1]
print(new_list)

new_set_2 = {x['a'] for x in dict_list if x['a'] > 2}
print(new_set_2)
```