
## 常用插件
shift + cmd + x 打开关闭插件安装界面

Chinese (Simplified) Language Pack for Visual Studio Code
汉化

Auto Close Tag
自动闭合HTML/XML标签
Auto Rename Tag
修改 html 标签，自动帮你完成头部和尾部闭合标签的同步修改

Beautify
格式化javascript，JSON，CSS，Sass，和HTML在Visual Studio代码。

Code Runner
可直接运行

HTML CSS Support
智能提示CSS类名以及id
JavaScript (ES6) code snippets
ES6语法智能提示，以及快速输入

dotjs-syntax
方便识别dot.js的代码

翻译（英汉词典）



## 快捷键

### 根据搜索的结果全部添加光标
{
  "key": "shift+cmd+l",
  "command": "addCursorsAtSearchResults",
  "when": "fileMatchOrMatchFocus && searchViewletVisible"
}

### 在行尾向上或向下添加光标
{
  "key": "alt+cmd+down",
  "command": "editor.action.insertCursorBelow",
  "when": "editorTextFocus"
}
{
  "key": "alt+cmd+up",
  "command": "editor.action.insertCursorAbove",
  "when": "editorTextFocus"
}

### 点击添加多个光标
alt+鼠标左键

### 选中内容然后向上或向下复制
{
  "key": "shift+alt+down",
  "command": "notebook.cell.copyDown",
  "when": "notebookEditorFocused && !inputFocus"
}
{
  "key": "shift+alt+up",
  "command": "notebook.cell.copyUp",
  "when": "notebookEditorFocused && !inputFocus"
}

