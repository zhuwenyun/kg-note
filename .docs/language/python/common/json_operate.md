



## json包
json 包时内置包，不需要额外下载安装
::: danger
中文乱码问题
ensure_ascii=False
ensure_ascii=False 在 json.dump(data, f, ensure_ascii=False) 中的意思是告诉Python解释器不要对非ASCII字符进行转义，‌这样在写入JSON文本时非ASCII字符（‌如中文）‌会是原样的Unicode字符，‌而不是被转换成ASCII编码（‌如\uXXXX形式）‌。‌
默认情况下，‌ensure_ascii 参数是 True，‌这意味着所有非ASCII字符都会被转义成ASCII编码，‌以确保dumps之后的结果里所有的字符都能够被ASCII表示。‌如果设置为 False，‌则这些字符会原样输出，‌这对于包含中文或其他非ASCII字符的JSON数据非常有用‌。‌
:::


### json字符串
```python
import json

jsonStr = '[{"name": "张三", "age": 24}]'
jsonObj = json.loads(jsonStr)
print(jsonObj)

jsonStrNew = json.dumps(jsonObj, ensure_ascii=False)
print(jsonStrNew)
```

### json文件
```python
import json

with open('test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    print(data)

data = {'name': '张三', 'age': 24}
with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False)
```



