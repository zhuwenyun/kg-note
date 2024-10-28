

## openpyxl与Pandas

pip install openpyxl
pip install pandas

openpyxl与Pandas在处理Excel文件时具有互补关系。‌Pandas是一个强大的数据分析和操作工具，‌其核心数据结构是DataFrame，‌非常适合进行数据清洗、‌转换、‌分析和可视化。‌而openpyxl则是一个用于读写Excel 2010 xlsx/xlsm/xltx/xltm文件的库。‌这两个库可以相互转换数据，‌例如，‌可以使用Pandas创建DataFrame并将其写入Excel文件，‌而openpyxl可以读取这个Excel文件并将其转换为Pandas的DataFrame。‌这种互补关系使得在处理Excel文件时，‌可以结合使用这两个库，‌充分利用它们各自的优势，‌提高数据处理的效率和便捷性‌。‌


### openpyxl读取Excel

```python
# encoding: utf-8

from openpyxl import load_workbook

# 加载Excel文件
workbook = load_workbook(filename='罚则放量批次记录（8.12）.xlsx')

# 获取所有工作表的名称
sheets = workbook.sheetnames

# 遍历工作表并进行操作
for sheet_name in sheets:
    # 加载工作表
    sheet = workbook[sheet_name]
    # 例如，遍历每一行每一列的数据
    for idx,row in enumerate(sheet.iter_rows(values_only=True)):
        if sheet_name == '8月':
            if idx > 0:
                if row[1] is not None:
                    data_dict = {}
                    data_dict['adcode']=row[1]
                    data_dict['city'] = row[0]
```



### pandas读取Excel

```python
# encoding: utf-8

import pandas as pd

# 用pandas读取Excel文件某个sheet
df = pd.read_excel('罚则放量1025.xlsx','Sheet1')

# 将数组转成字典数组
data = df.to_dict(orient='records')
# [{'城市名称': '洛阳', '城市code': 410300}, {'城市名称': '徐州', '城市code': 320300, }]
```

### pandas写出Excel
```python
# encoding: utf-8

import pandas as pd

data = [['Alice', 23], ['Bob', 30], ['Charlie', 35]]

df = pd.DataFrame(data, columns=['Name', 'Age'])

df.to_excel('output.xlsx')
```