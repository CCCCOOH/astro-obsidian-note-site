# GitHub Proxy 地址发布页

> 来源: https://ghproxy.link/
> 记录时间: 2026-05-29

**用途**: GitHub 代理服务，用于加速国内访问 GitHub（clone、下载等）。基于 [hunshcn/gh-proxy](https://github.com/hunshcn/gh-proxy) 项目。

## 说明

为避免主站被 GFW 封锁导致无法访问，请收藏此发布页，以获取最新可用域名。

---

## 当前可用站点

### ghfast.top

- **地址**: https://ghfast.top/
- **状态**: ✅ 当前可用
- **服务**: GitHub 文件、Releases、archive、gist、raw.githubusercontent.com 文件代理加速下载
- **发布站**: https://ghproxy.link/
- **不支持**: SSH Key 方式 git clone

#### 终端命令行用法

**git clone (公开仓库)**
```
git clone https://ghfast.top/https://github.com/stilleshan/dockerfiles
```

**git clone (私有仓库)**
```
git clone https://user:your_token@ghfast.top/https://github.com/your_name/your_private_repo
```
需配合 [Personal access tokens](https://github.com/settings/tokens) 使用。

**wget**
```
wget https://ghfast.top/https://github.com/stilleshan/dockerfiles/archive/master.zip
wget https://ghfast.top/https://raw.githubusercontent.com/stilleshan/dockerfiles/main/README.md
```

**curl**
```
curl -O https://ghfast.top/https://github.com/stilleshan/dockerfiles/archive/master.zip
curl -O https://ghfast.top/https://raw.githubusercontent.com/stilleshan/dockerfiles/main/README.md
```

#### 首页下载（在页面输入框贴链接）

| 类型 | 示例链接 |
|------|---------|
| Raw 文件 | https://raw.githubusercontent.com/stilleshan/dockerfiles/main/README.md |
| 分支源码 | https://github.com/stilleshan/dockerfiles/archive/master.zip |
| Releases 源码 | https://github.com/fatedier/frp/archive/refs/tags/v0.54.0.zip |
| Releases 文件 | https://github.com/fatedier/frp/releases/download/v0.54.0/frp_0.54.0_linux_amd64.tar.gz |

## 域名列表

| 域名 | 状态 |
|------|------|
| https://ghfast.top | ✅ 当前可用 |
| ~~https://ghgo.xyz~~ | ❌ 已被墙 |
| ~~https://ghp.ci~~ | ❌ 已被墙 |
| ~~https://ghproxy.com~~ | ❌ 已被墙 |

## 推广信息

- RedteaGO - 大陆漫游 eSim 流量卡
- IPLC 机场推广（4K/8K 流畅，解锁流媒体和 ChatGPT）

## 其他页面

- 首页: ghproxy.link
- 捐赠打赏
- 商务咨询
- 推荐 IPLC 机场
