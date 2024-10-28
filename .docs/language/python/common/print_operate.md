



```python
print()  # 输出一个空行
print('')  # 输出一个空行
print("没有伟大的愿望，就没有伟大的天才!")  # 使用双引号将字符串括起来

# 使用三引号可多行输出字符，如三行输出的服务器登录界面
print(''' 登录服务器
管理员：___________
密 码：___________ ''')  # 字符最前和最后用三引号

print('go big or go home')  # 使用单引号将字符串括起来
print('go', 'big', 'or', 'go', 'home')  # 字符之间用','间隔，则字符串用空格连接
print('go' 'big' 'or' 'go' 'home')  # 字符之间不用','间隔，则字符串无空格连接
print('go' + 'big' + 'or' + 'go' + 'home')  # 用加号'+'连接输出字符串

print('www', 'mingrisoft', 'com', sep='.')  # 设置间隔符，字符之间用'.'间隔
print('2020', '7', '24', sep='-')  # 设置间隔符，字符之间用'-'间隔
print(50 * '= ')  # 一次输出多个字符，使用数字、运算符和字符串

# 使用chr()函数，根据字符的ASCII码值，输出字符
print(chr(65))  # 大写字母的ASCII码值为65~90，输出：A
print(chr(97))  # 小写字母的ASCII码值为97~122，输出：a
print(chr(8544), chr(8545), chr(8546), chr(8547))  # 输出：Ⅰ Ⅱ Ⅲ Ⅳ
# 使用ord()函数将字符转换为对应的整数
print(ord('生'), ord('化'), ord('危'), ord('机'))  # 输出：29983 21270 21361 26426
```

```python
print(1314)  # 直接输出整数，可不带双引号或单引号。输出结果：1314
print(12.22)  # 直接输出浮点数。输出结果：12.22
print(10 / 3)  # 可以包含算术表达式，输出运算结果为：3.3333333333333335
print(100 * 3.13 + 60)  # 可以包含算术表达式，输出运算结果为：373
print(2, 0, 2, 0)  # 使用','连接要输出的数值，中间用空格连接。输出结果：2 0 2 0
print(192, 168, 1, 1, sep='.')  # 使用'.'连接输出数值，数值间用'.'间隔。输出结果：192.168.1.1
# 不能直接使用'+'连接字符串和数值，会报错。异常信息为：
# TypeError: can only concatenate str (not "int") to str
print("广州恒大" + 43)  # 错误写法
# 使用'+'连接字符串和数值时，数值要转换为字符串。输出结果：广州恒大43
print("广州恒大" + str(43))
# 使用','连接字符串和数值，字符串和数值用空格分隔。输出结果：广州恒大 43
print("广州恒大", 43)
# 使用操作符'%e'%格式化数值为科学记数法。输出结果：1.205633e+14
print("%e" % 120563332111098)
```



```python
s1 = 'go big or go home'  # 定义一个字符串变量s1
print(s1)  # 输出变量s1的值
num = 27  # 定义一个数值型变量num
print(num)  # 输出变量num的值

s2 = '你若盛开'  # 定义字符串变量s2
s3 = '蝴蝶自来'  # 定义字符串变量s3
print(s2, s3)  # 使用','连接变量s2和s3，中间用空格分隔
print(s2 + '\n' + s3)  # 使用'\n'连接变量s2和s3，换行分隔
print(s2 + s3)  # 使用'+'连接变量s2和s3，直接连接无空格
print(s2 + '\n', s3)  # 添加'\n'换行后，使用'，'连接的字符串前面仍然有一个空格

name = ['杨过', '临安', '1224', '小龙女']
print(name)
print('--'.join(name))  # 使用'--'连接列表内数据
print(' '.join(name))  # 使用空格' '连接列表内数据
print(''.join(name))  # 直接连接列表内数据

word = '世界那么大，'
name = '黄蓉'
how = '想出去看看！！'
print(word, name, how)  # 用','连接变量，中间用空格分隔
print(word, name, how, sep='.')  # 设置间隔符为'.'
print(word, name, how, sep='****')  # 设置间隔符为'****"

word = ["南京", "苏州", "上海", "杭州", "宁波"]
for item in word:  # 遍历列表
    print(item)  # 输出每个列表元素

word = ["南京", "苏州", "上海", "杭州", "宁波"]
for item in word:  # 输出列表变量的数据到一行
    print(item + ">>", end="")  # 元素之间用'>>'连接(不换行)

team = "广州恒大"
points = 63
print(team, points)  # 使用','可以直接连接字符串变量和数字变量
# 使用'+'连接字符串变量和数值变量前，必须先将数字转换为字符串
print(team + str(points))

un_title = ('人生苦短', '我用Python')
print(un_title)  # 打印元组
print(un_title[0]) # 打印元组中的第一个元素
print(un_title[1][2:])
un_title = ['Python', 18, '人生苦短，我用Python']
print(un_title)  # 打印列表
print(un_title[2])  # 打印列表中的第三个元素
```



```python
for x in range(0, 10):  # 设置输出内容区间为0~9
    print(x, end=' ')  # 输出数字用空格间隔输出到一行
for x in range(0, 10):  # 置输出内容区间为0~9
    print(x, end='+')  # 输出数字用加号连接
print("? = 100")  # 输出结果和原输入内容形成计算题
# 执行结果:0 1 2 3 4 5 6 7 8 9 0+1+2+3+4+5+6+7+8+9+? = 100
```


```python
x = 112
print("%o" % x)  # 使用操作符输出八进制数
print("%x" % x)  # 使用操作符输出十六进制数
print("nHex = %x,nDec = %d,nOct = %o" % (x, x, x))  # 输出十六进制、十进制、八进制数
print(bin(x))  # 使用bin()函数输出二进制数
print(oct(x))  # 使用oct()函数输出八进制数
print(hex(x))  # 使用hex()函数输出十六进制数
print('------------------------------------------------')
x = 112
print("{0:d}".format(x))  # 使用format函数输出十进制数
print("{0:x}".format(x))  # 使用format函数输出十六进制数
print("{0:o}".format(x))  # 使用format函数输出八进制数
print("{0:b}".format(x))  # 使用format函数输出二进制数
print("int: {0:d};  hex: {0:x};  oct: {0:o};  bin: {0:b}".format(x))  # 综合输出进制数
# 综合输出带符号的各进制数
print("二进制: {0:#b}; 八进制: {0:#o} ;十进制: {0:#d};  十六进制: {0:#x}".format(x))
```