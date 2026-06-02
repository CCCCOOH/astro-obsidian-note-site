`pm2` 指令：

```sh
pm2 start npm --name koishi -- run start
pm2 start run.js -- name sy-run.js
pm2 restart 0
pm2 stop 0
pm2 list
```

`git` 指令：

```sh
git fetch origin
git reset --hard origin/master
```

`npm` 发包：

```sh
npm config set registry https://registry.npmjs.org/
npm config get registry
# https://registry.npmjs.org/
npm whoami
npm login --registry=https://registry.npmjs.org/
npm view your-package-name # 检测占用
```

切源：

```json
{
  "name": "koishi-plugin-xxx",
  "version": "0.1.0",
  "main": "lib/index.js",
  "files": ["lib"],
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  }
}
```


`docker` 重启后端：

```sh
docker compose restart # 重启llbot
pm2 restart 0 # 重启机器人控制脚本
```