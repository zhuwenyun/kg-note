


## 模版字符串

### 使用%s和%来替换

```python
# 定义模版
str_template = "My name is %s and I am %d years old."
# 定义变量
name = "Alice"
age = 30
# 用变量替换占位符
new_str = str_template % (name, age)
# 输出替换后的字符串
print(new_str)

# 直接替换输出
print(str_template % (name, age))
```

### 使用str.format()来替换

```python
# 定义模版
str_template = "My name is {} and I am {} years old."
# 定义变量
name = "Alice"
age = 30
# 用变量替换占位符
new_str = str_template.format(name, age)
# 输出替换后的字符串
print(new_str)
# 直接替换输出
print(str_template.format(name, age))
```

### 使用f-string来替换

```python
# 定义模版
str_template = "My name is {} and I am {} years old."
# 定义变量
name = "Alice"
age = 30
# 用变量替换占位符
new_str = f"My name is {name} and I am {age} years old."
# 输出替换后的字符串
print(new_str)
# 直接替换输出
print(f"My name is {name} and I am {age} years old.")
```

格式化数字
```python
# 共4位，左边补0
formatted_string = f"{i:0>4}"
formatted_string = f"{i:04}"
# 共4位，右边补0
formatted_string = f"{i:0<4}"

# 结合用法
sql = "ALTER TABLE driver_task_%s ADD COLUMN execute_end_time datetime comment '任务执行结束的时间';"
for i in range(128):
    formatted_string = f"{i:0>4}"
    new_str = sql % formatted_string
    print(new_str)
```





range(start, stop, step)
start：序列开始的数值，默认为0。
stop：序列结束的数值，不包括此值。
step：步长，默认为1。

