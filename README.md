
# shadowsocks-ws

Shadowsocks-WS 可以隐匿 Shadowsocks 流量，可以部署在 [Heroku](https://www.heroku.com/)。

Shadowsocks-WS 既是一个 Shadowsocks 服务器，也是一个 Web 服务器。也就是说，在部署 Shadowsocks 服务器的同时，也架设了一个实实在在的网站。

Shadowsocks 流量基于 WebSocket 协议传送给 Web 服务器，成为网站流量的一部分，再由 Web 服务器转交给 Shadowsocks 服务器，从而达到隐匿 Shadowsocks 流量的目的。

Shadowsocks-WS 的本地组件只负责转发 Shadowsocks 流量，须配合现有 [Shadowsocks 客户端](https://github.com/shadowsocks/shadowsocks-windows) 使用。

## 环境要求

- [Node.js](https://nodejs.org/zh-cn/download/current/) 15.8.0+
- [npm](https://nodejs.org/zh-cn/download/current/) 7.5.1+
- [Git](https://gitforwindows.org/)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

为提高 `npm` 的下载速度，建议使用淘宝 NPM 镜像：

```shell
$ npm config set registry https://registry.npm.taobao.org
```

可以通过 `npm` 安装 Heroku CLI：

```shell
$ npm install -g heroku
```

更多安装方式参见 [Heroku 的官方文档](https://devcenter.heroku.com/articles/heroku-cli#download-and-install) 。

## 部署在 Heroku

登录你的 Heroku 账户：

```shell
$ heroku auth:login -i
heroku: Enter your login credentials
Email: ******
Password: ******
Logged in as ******
```

如果你还没有 Heroku 账户，请前往 [Heroku 官网](https://www.heroku.com/) 注册。

将你的 SSH 公钥添加到 Heroku：

```shell
$ heroku keys:add
Found an SSH public key at /home/xxxx/.ssh/id_rsa.pub
? Would you like to upload it to Heroku? (Y/n) 
```

如果你还没有 SSH 公钥，请阅读 [生成/添加SSH公钥](https://gitee.com/help/articles/4181)。

克隆代码到本地，进入项目根目录：

```shell
$ git clone https://github.com/totravel/shadowsocks-ws.git
$ cd shadowsocks-ws
```

新建一个 APP：

```shell
$ heroku create
Creating app... done, ⬢ xxxxx
https://xxxxx.herokuapp.com/ | https://git.heroku.com/xxxxx.git
Git remote heroku added
```

左边的 `https://xxxxx.herokuapp.com/` 就是 APP 的 URL。

设置加密算法、密码：

```shell
$ heroku config:set METHOD="chacha20-ietf-poly1305" PASS=123456
```

只支持 `chacha20-ietf-poly1305` 和 `aes-256-gcm` 两种加密算法。

推送代码到 Heroku：

```shell
$ git push heroku master
```

## 客户端配置

安装本地组件：

```shell
$ npm install
```

将配置文件 `config.json.example` 重命名为 `config.json` 并修改 `url` `password` `method` 字段。

```json
{
    "url": "wss://xxxxx.herokuapp.com/",
    "server": "127.0.0.1",
    "remote_port": 8787,
    "password": "123456",
    "method": "chacha20-ietf-poly1305"
}
```

双击命令脚本 `start.cmd` 启动本地组件：

```shell
config loaded
ss://*****@127.0.0.1:8787
testing...
cookie saved
server started
```

复制第二行 `ss://*****@127.0.0.1:8787`，打开 Shadowsocks 客户端，在托盘区找到 Shadowsocks 客户端的图标 > 右击 > 服务器 > 从剪贴板导入 URL > ... > 确定。

在浏览器中使用（以 Firefox 为例）：

1. 右击 Shadowsocks 客户端的图标 > PAC 模式 > 复制本地 PAC 网址。
1. 打开浏览器 > 菜单 > 选项 > 网络设置（最底部） > 自动代理配置的 URL（PAC） > 粘贴 > 确定。

## 许可协议

[The MIT License (MIT)](http://opensource.org/licenses/MIT)
