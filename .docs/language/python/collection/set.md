
## 创建
```python
my_set = {1, 2, 3}
my_set = set([1, 2, 3])
```
注意：若意图创建空集合，‌应使用set()而非{}，‌因为{}会被解释为空字典。‌‌


## 增加
```python
my_set.add(3)
```

## 检索
```python
my_set.contains(3)
```

## 删除
```python
# 移除列表中某个值,没有返回值
my_set.remove(3)
# 移除列表中的一个元素，并且返回该元素
my_set.pop(3)
# 清空列表中所有的元素
my_set.clear()
```

## 更新
```python
# 先删除再添加
my_set.remove(3)
my_set.add(5)
```

## 遍历
```python
set = {5, 1, 3}

for e in set:
    print(e)

for i, e in enumerate(set):
    print(i, e)
```