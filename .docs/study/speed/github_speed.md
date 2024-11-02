

手动加速比较费劲，建议通过现成的工具加速！！！

转下载地址，很好用
https://mirror.ghproxy.com/ 【亲测可以】
https://ghp.ci/【亲测可以】


FastGithub 繁琐
Watt Toolkit【推荐二】
dev-sidecar 【主推（使用方便简单）】
https://github.com/docmirror/dev-sidecar/releases/download/v1.8.8/DevSidecar-1.8.8-node17.dmg
https://github.com/docmirror/dev-sidecar/releases/download/v1.8.8/DevSidecar-1.8.8-node17.exe


Failed to connect to github.com port 443 after 9 ms: Couldn't connect to server
原因是开启了代理，导致直接访问443端口还是很慢
# 使用http和https代理
git config --global http.proxy http://127.0.0.1:31181
git config --global https.proxy https://127.0.0.1:31181
# 关闭http和https代理
git config --global --unset http.proxy
git config --global --unset https.proxy

git config --global http.sslVerify "false"