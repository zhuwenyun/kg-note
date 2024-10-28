


## 集合





```python
m=['a', 'b', 'c', ['aa', 'bb', 'cc', ['aaa', 'bbb', 'ccc']]]
# 嵌套写法
for e in m:
  if isinstance(e,list):
    for n_e in e:
      if isinstance(n_e,list):
        for n_n_e in n_e:
          print("\t","\t",n_n_e)
      else:
        print("\t",n_e)
  else:
    print(e)

# 函数写法
def print_list(in_list,level=1):
  for e in in_list:
    if isinstance(e,list):
      print_list(e,level+1)
    else:
      for i in range(level-1):
        print("\t",end="")
      print(e)
print_list(m)
```







