
思路
1、

```python
# coding:utf-8

import pandas as pd
import json
from collections import defaultdict

# 用pandas读取Excel文件某个sheet
df = pd.read_excel('罚则放量1112_new.xlsx','Sheet1')

# 将数组转成字典数组
data = df.to_dict(orient='records')
# print(data)

result_dict = defaultdict(list)
for d in data:
    result_dict[str(d['城市code'])].append(d['平台ID'])

# print(result_dict)

# 读取原数据
with open('SpPenaltyConfig.json', 'r') as f:
    jsonOld = json.load(f)

print(json.dumps(jsonOld))

# 无则新增，有则追加
for k, v in result_dict.items():
    jsonCitySet = {item['adcode'] for item in jsonOld['cityList']}

    if k in jsonCitySet:
        for item in jsonOld['cityList']:
            if k == item['adcode']:
                item['openTenantIds'].extend(v)
    else:
        newDict = {
            "adcode": k,
            "openTenantIds": [],
            "closeTenantIds": [],
            "allTenantOpen": False
        }
        newDict['openTenantIds'].extend(v)
        jsonOld['cityList'].append(newDict)

print(json.dumps(jsonOld))
```