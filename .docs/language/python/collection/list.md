
## 创建
```python
my_list = list()
my_list = [1, 2, 3]
```

## 增加
```python
# list.append(obj) 在末尾追加元素
my_list.append(1)
my_list.append(2)
# list.insert(index, obj) 在指定位置插入元素
my_list.insert(1,3)
# extend 一次添加多个元素
new_elements = [4, 5, 6]
my_list.extend(new_elements)
```

## 检索
```python
# 从列表中找出某个值第一个匹配项的索引位置
idx = my_list.index(2)
# 返回索引对应的元素
my_data = my_list[idx]
```

## 删除
```python
# 移除列表中某个值的第一个匹配项,没有返回值
my_list.remove(3)
# 移除列表中的一个元素（默认最后一个元素），并且返回该元素
my_list.pop(3)
# 清空列表中所有的元素
my_list.clear()
```

## 更新
```python
# 修改索引位置的元素值
my_list[0]=999
```

## 遍历
```python
list = [5, 1, 3]

for e in list:
    print(e)

for i, e in enumerate(list):
    print(i, e)

```