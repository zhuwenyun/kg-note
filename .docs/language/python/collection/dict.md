
## 创建
```python
my_dict = {}
my_dict = {'a': 1, 'b': 2}
```

## 增加
```python
my_dict['c']=3
```

## 检索
```python
my_data = my_dict['a']
```

## 删除
```python
del my_dict['c']
removed_value = my_dict.pop('c')
my_dict.clear()
```

## 更新
```python
# 修改索引位置的元素值
my_dict['c']=4
```

## 遍历
```python
dict = {'b': 2, 'a': 1, 'c': 3}

for k, v in dict.items():
    print(k, v)

for k in dict.keys():
    print(k, dict[k])

for v in dict.values():
    print(v)
```