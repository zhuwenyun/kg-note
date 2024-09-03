
将更改推送到 main 分支并等待 GitHub Action 工作流完成。你应该看到站点部署到 https://<username>.github.io/[repository]/ 或 https://<custom-domain>/，这取决于你的设置。你的站点将在每次推送到 main 分支时自动部署。


https://zhuwenyun.github.io/kg-note/





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




```yml
- name: Setup Node.js environment
  uses: actions/setup-node@v4.0.3
  with:
    # Set always-auth in npmrc.
    always-auth: # optional, default is false
    # Version Spec of the version to use. Examples: 12.x, 10.15.1, >=10.15.0.
    node-version: # optional
    # File containing the version Spec of the version to use.  Examples: package.json, .nvmrc, .node-version, .tool-versions.
    node-version-file: # optional
    # Target architecture for Node to use. Examples: x86, x64. Will use system architecture by default.
    architecture: # optional
    # Set this option if you want the action to check for the latest available version that satisfies the version spec.
    check-latest: # optional
    # Optional registry to set up for auth. Will set the registry in a project level .npmrc and .yarnrc file, and set up auth to read in from env.NODE_AUTH_TOKEN.
    registry-url: # optional
    # Optional scope for authenticating against scoped registries. Will fall back to the repository owner when using the GitHub Packages registry (https://npm.pkg.github.com/).
    scope: # optional
    # Used to pull node distributions from node-versions. Since there's a default, this is typically not supplied by the user. When running this action on github.com, the default value is sufficient. When running on GHES, you can pass a personal access token for github.com if you are experiencing rate limiting.
    token: # optional, default is ${{ github.server_url == 'https://github.com' && github.token || '' }}
    # Used to specify a package manager for caching in the default directory. Supported values: npm, yarn, pnpm.
    cache: # optional
    # Used to specify the path to a dependency file: package-lock.json, yarn.lock, etc. Supports wildcards or a list of file names for caching multiple dependencies.
    cache-dependency-path: # optional
          
```