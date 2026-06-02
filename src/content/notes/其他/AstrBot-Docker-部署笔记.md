# AstrBot Docker 部署笔记

## 一、环境准备

- **服务器**：阿里云 ECS（Ubuntu/Debian）
- **部署方式**：Docker + DaoCloud 国内镜像加速
- **数据目录**：`~/astrbot/data`
[]()
---

## 二、部署步骤

### 1. 创建目录并进入

```bash
mkdir -p ~/astrbot
cd ~/astrbot
```

### 2. 使用 DaoCloud 镜像源部署（国内推荐）

```bash
sudo docker run -itd \
  -p 6185:6185 \
  -p 6199:6199 \
  -v $PWD/data:/AstrBot/data \
  -v /etc/localtime:/etc/localtime:ro \
  -v /etc/timezone:/etc/timezone:ro \
  --name astrbot \
  m.daocloud.io/docker.io/soulter/astrbot:latest
```

**参数说明**：
| 参数 | 说明 |
|------|------|
| `-p 6185:6185` | 管理面板端口 |
| `-p 6199:6199` | API 服务端口 |
| `-v $PWD/data:/AstrBot/data` | 持久化数据目录 |
| `-v /etc/localtime:/etc/localtime:ro` | 同步宿主机时区 |
| `--name astrbot` | 容器名称 |

### 3. 验证容器运行状态

```bash
sudo docker ps | grep astrbot
```

预期输出：状态为 `Up`，端口 `0.0.0.0:6185->6185/tcp`

---

## 三、获取管理面板信息

### 1. 查看启动日志

```bash
sudo docker logs astrbot
```

### 2. 提取关键信息

```bash
# 查找管理面板地址
sudo docker logs astrbot | grep -E "管理面板|http"

# 查找初始密码
sudo docker logs astrbot | grep -E "初始密码|password"
```

**典型输出**：
```
🌈 管理面板已启动，可访问: http://0.0.0.0:6185
🔐 初始密码: xxxxxxxx
```

### 3. 获取服务器公网 IP

```bash
# 方法一
curl ifconfig.me

# 方法二（阿里云内网元数据）
curl http://100.100.100.200/latest/meta-data/public-ipv4
```

### 4. 访问管理面板

```
http://你的服务器IP:6185
```

- **用户名**：`astrbot`
- **密码**：日志中的初始密码（首次登录后请立即修改）

---

## 四、阿里云安全组配置

如果无法访问，需要在阿里云控制台放行端口：

1. 登录阿里云控制台 → ECS → 安全组
2. 添加入方向规则：
   - 端口范围：`6185`
   - 协议：`TCP`
   - 授权对象：`0.0.0.0/0`（或你的 IP）

---

## 五、Docker 镜像加速器配置（可选）

如果 Docker Hub 拉取慢，可配置阿里云加速器：

```bash
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://registry.cn-hangzhou.aliyuncs.com",
    "https://docker.m.daocloud.io"
  ]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

---

## 六、常用管理命令

| 操作 | 命令 |
|------|------|
| 查看日志 | `sudo docker logs -f astrbot` |
| 重启 | `sudo docker restart astrbot` |
| 停止 | `sudo docker stop astrbot` |
| 启动 | `sudo docker start astrbot` |
| 删除容器 | `sudo docker rm astrbot` |
| 进入容器 | `sudo docker exec -it astrbot bash` |

---

## 七、部署其他镜像源（备选）

如果 DaoCloud 不可用，可尝试以下替代源：

```bash
# 阿里云镜像
registry.cn-hangzhou.aliyuncs.com/soulter/astrbot:latest

# 南京大学镜像
docker.nju.edu.cn/soulter/astrbot:latest
```

---

## 八、部署成功后的下一步

1. ✅ 登录管理面板
2. ✅ 修改默认密码
3. ⬜ 配置消息平台（QQ/微信/飞书等）
4. ⬜ 配置 AI 模型（OpenAI/DeepSeek 等）
5. ⬜ 安装需要的插件

---

**笔记版本**：v1.0  
**最后更新**：2026-05-29  
**部署状态**：✅ 成功
[]()