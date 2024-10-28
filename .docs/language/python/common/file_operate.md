


Python中的with open语句用于打开文件并进行读写操作。‌使用时需要指定文件路径和打开模式，‌文件路径可以是相对路径或绝对路径。‌打开模式包括：‌
● 'r'：‌只读模式，‌如果文件不存在，‌会抛出FileNotFoundError异常。‌
● 'w'：‌只写模式，‌如果文件不存在，‌会创建一个新文件；‌如果文件已存在，‌会覆盖原有内容。‌
● 'a'：‌追加模式，‌如果文件不存在，‌会创建一个新文件；‌如果文件已存在，‌会在文件末尾添加内容。‌
● 'x'：‌独占写入模式，‌如果文件已存在，‌会抛出FileExistsError异常。‌
with open还有一个可选参数encoding，‌用于解码或编码文件的字符集，‌默认值为'utf-8'。‌使用with open时，‌可以使用as关键字将文件赋值给一个变量。‌在with块结束后，‌文件会自动关闭‌。‌

```python
with open('test.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    print(data)
```