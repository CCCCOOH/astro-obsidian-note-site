# Hermes Agent 连接本地浏览器

> 来源：[麦冬AI实验室 · 飞书文档](https://acnqkoghhk9b.feishu.cn/wiki/VGOSwEbUeiAndhk4lP0c4zZdnrd)  
> 摘录时间：2026-05-28

---

## 概述

让 Hermes Agent 直接操控本机已安装的 Chrome 浏览器，支持 macOS 和 Windows + WSL 两种环境。

---

## macOS

### 第一步：启动 Chrome 调试模式

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.chrome-debug-profile" \
  --no-first-run \
  --no-default-browser-check
```

> `--user-data-dir` 使用独立配置文件，不影响日常使用的 Chrome。

Chrome 窗口弹出后即可进行下一步。

### 第二步：Hermes 连接浏览器

在 Hermes 中输入：

```
/browser connect ws://localhost:9222
```

### 第三步：验证连接

连接成功后，Hermes 就可以直接操控浏览器了（导航、点击、截图等）。

---

## Windows + WSL

### 第一步：在 PowerShell 中启动 Chrome 调试模式

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 `
  --user-data-dir="$env:USERPROFILE\.chrome-debug-profile" `
  --no-first-run `
  --no-default-browser-check
```

### 第二步：配置 WSL 镜像网络（仅需一次）

编辑 `/etc/wsl.conf`：

```ini
[network]
networkingMode=mirrored
```

然后重启 WSL：`wsl --shutdown`

### 第三步：Hermes 连接浏览器

```bash
/browser connect ws://<Windows-IP>:9222
```

---

## 注意事项

- `--user-data-dir` 使用独立配置文件，不会影响日常使用的 Chrome
- 调试端口默认为 9222，可自定义
- 确保防火墙没有拦截 9222 端口
- WSL 需配置镜像网络模式才能访问 Windows 端的 Chrome
