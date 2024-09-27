

https://www.electronjs.org/zh/docs/latest/

Electron是什么？
Electron是一个使用 JavaScript、HTML 和 CSS 构建桌面应用程序的框架。 嵌入 Chromium 和 Node.js 到 二进制的 Electron 允许您保持一个 JavaScript 代码代码库并创建 在Windows上运行的跨平台应用 macOS和Linux——不需要本地开发 经验。

Electron Fiddle 运行实例
Electron Fiddle 是由 Electron 开发并由其维护者支持的沙盒程序。 我们强烈建议将其作为一个学习工具来安装，以便在开发过程中对Electron的api进行实验或对特性进行原型化。


本指南将会通过使用Electron创建一个极简的 Hello World 应用一步步的带你了解，该应用与electron/electron-quick-start类似。
通过这个教程，你的app将会打开一个浏览器窗口，来展示包含当前正在运行的 Chromium, Node.js与 Electronweb等版本信息的web界面


在使用Electron进行开发之前，您需要安装 Node.js。 我们建议您使用最新的LTS版本。

Electron 应用程序遵循与其他 Node.js 项目相同的结构。 首先创建一个文件夹并初始化 npm 包。
mkdir my-electron-app && cd my-electron-app
npm init

init初始化命令会提示您在项目初始化配置中设置一些值 为本教程的目的，有几条规则需要遵循：
entry point 应为 main.js.
author 与 description 可为任意值，但对于应用打包是必填项。
```
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "Hello World!",
  "main": "main.js",
  "author": "Jane Doe",
  "license": "MIT"
}
```
