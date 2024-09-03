说明

- workflow_dispatch

在GitHub Actions中，`workflow_dispatch`是一个事件类型，它允许用户手动触发一个工作流。当你在`.github/workflows`目录下的YAML文件中定义了一个`workflow_dispatch`事件时，这意味着你可以通过GitHub Actions界面手动启动这个工作流，而不需要等待特定的代码更改或事件自动触发。因此，`workflow_dispatch`后面不需要直接跟任何值，因为它是由用户界面操作触发的，而不是由代码更改或其他事件自动触发的。

- uses: actions/checkout@v4

**actions/checkout**‌：‌GitHub Actions中的一个预定义操作，‌用于拉取仓库代码到runner中，‌以便进行后续的构建、‌测试或部署。‌

**@v4**‌：‌指定使用的checkout操作的版本号为4。‌GitHub Actions中的操作（‌actions）‌可以有多个版本，‌使用版本号可以确保使用特定版本的操作，‌以避免因操作更新导致的工作流程问题。‌







‌**GitHub Actions中uses与run的区别主要在于执行方式和步骤划分**‌。‌

- ‌**执行方式**‌：‌uses关键字用于指定要使用的action，‌可以是一个GitHub仓库、‌Docker镜像或者JavaScript action的路径。‌而run关键字则用于执行shell命令。‌
- ‌**步骤划分**‌：‌在GitHub Actions的工作流程中，‌使用uses可以将多个命令封装在一个action中执行，‌这样在工作流程中只算作一个步骤。‌而使用run时，‌每个run关键字下的命令都会被视为一个独立的步骤，‌如果其中一个命令失败，‌可以更容易地定位问题所在。‌

综上所述，‌uses和run在执行方式和步骤划分上存在差异，‌根据具体需求选择使用。‌