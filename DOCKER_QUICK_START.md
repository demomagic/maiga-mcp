# Docker Quick Start Guide

## ⚡ 快速开始

### 重要说明

当前 Docker 镜像使用 **运行时构建** 方式：
- 📦 镜像包含所有源代码和依赖
- 🔨 容器启动时自动运行 `smithery build`
- 🚀 构建完成后启动 MCP 服务器
- ⏱️  首次启动需要约 5-10 秒的构建时间

### 1. 构建镜像

```bash
docker build -t maiga-mcp:latest .
```

构建时间：约 1-2 分钟  
镜像大小：约 429MB（包含所有依赖，支持运行时构建）  
首次启动时间：约 5-10 秒（需要运行 smithery build）

### 2. 运行容器（方式一：直接运行）

```bash
docker run -d \
  --name maiga-mcp-server \
  -p 8081:8081 \
  -e MAIGA_API_TOKEN=your_partner_api_token_here \
  maiga-mcp:latest
```

### 3. 运行容器（方式二：使用 docker-compose）

```bash
# 创建 .env 文件
cp .env.example .env

# 编辑 .env 文件，添加你的 API token
# MAIGA_API_TOKEN=your_partner_api_token_here

# 启动服务
docker-compose up -d
```

### 4. 验证服务运行

```bash
# 查看容器状态
docker ps | grep maiga-mcp

# 查看日志
docker logs maiga-mcp-server

# 或使用 docker-compose
docker-compose logs -f maiga-mcp
```

### 5. 测试服务

```bash
# 健康检查（如果有的话）
curl http://localhost:8081/health

# 或查看 MCP 端点
curl http://localhost:8081/
```

### 6. 停止服务

```bash
# 直接运行方式
docker stop maiga-mcp-server
docker rm maiga-mcp-server

# docker-compose 方式
docker-compose down
```

## 常见命令

### 查看容器信息

```bash
# 查看所有容器
docker ps -a

# 查看镜像
docker images | grep maiga-mcp

# 进入容器 shell（调试用）
docker exec -it maiga-mcp-server sh
```

### 查看日志

```bash
# 实时日志
docker logs -f maiga-mcp-server

# 最近 100 行日志
docker logs --tail 100 maiga-mcp-server

# docker-compose 方式
docker-compose logs -f
docker-compose logs --tail 100
```

### 重启服务

```bash
# 直接运行方式
docker restart maiga-mcp-server

# docker-compose 方式
docker-compose restart
```

### 更新服务

```bash
# 1. 停止并删除旧容器
docker-compose down

# 2. 重新构建镜像
docker-compose build

# 3. 启动新容器
docker-compose up -d
```

## 故障排查

### 端口冲突

```bash
# 检查端口是否被占用
lsof -i :8081

# 或
netstat -an | grep 8081

# 如果端口被占用，可以在运行时更改端口
docker run -d \
  --name maiga-mcp-server \
  -p 8082:8081 \
  -e MAIGA_API_TOKEN=your_token \
  maiga-mcp:latest
```

### 容器无法启动

```bash
# 查看详细日志
docker logs maiga-mcp-server

# 检查容器状态
docker inspect maiga-mcp-server

# 以交互模式运行（调试用）
docker run -it --rm \
  -p 8081:8081 \
  -e MAIGA_API_TOKEN=your_token \
  maiga-mcp:latest
```

### 清理 Docker 资源

```bash
# 删除所有停止的容器
docker container prune

# 删除未使用的镜像
docker image prune

# 删除所有未使用的资源（慎用）
docker system prune -a
```

## 生产环境部署

### 使用环境文件

```bash
# 创建生产环境配置
cat > .env.production << EOF
MAIGA_API_TOKEN=your_production_token
NODE_ENV=production
PORT=8081
EOF

# 使用环境文件启动
docker run -d \
  --name maiga-mcp-server \
  -p 8081:8081 \
  --env-file .env.production \
  --restart unless-stopped \
  maiga-mcp:latest
```

### 使用 Docker 网络

```bash
# 创建自定义网络
docker network create maiga-network

# 在自定义网络中运行
docker run -d \
  --name maiga-mcp-server \
  --network maiga-network \
  -p 8081:8081 \
  -e MAIGA_API_TOKEN=your_token \
  --restart unless-stopped \
  maiga-mcp:latest
```

### 设置资源限制

```bash
docker run -d \
  --name maiga-mcp-server \
  -p 8081:8081 \
  -e MAIGA_API_TOKEN=your_token \
  --memory="512m" \
  --cpus="1.0" \
  --restart unless-stopped \
  maiga-mcp:latest
```

## 性能优化

### 多阶段构建优化

当前 Dockerfile 已经使用多阶段构建：
- **Builder 阶段**：安装所有依赖并构建项目
- **Production 阶段**：仅复制必要文件和生产依赖

这样可以：
- 减小最终镜像大小
- 提高安全性（不包含构建工具）
- 加快部署速度

### 镜像大小对比

- `node:20` (完整版): ~1GB
- `node:20-slim` (当前使用): ~429MB (包含所有依赖，支持运行时构建)
- `node:20-alpine`: ~150MB (但与 keytar 不兼容)

### 运行时构建方式

当前方案使用 **运行时构建** 策略：

**容器启动流程**：
1. 容器启动时运行 `start.sh` 脚本
2. 脚本执行 `smithery build` 创建 `.smithery/index.cjs` 打包文件
3. 脚本启动服务器：`node .smithery/index.cjs`

**优势**：
- ✅ 灵活性高：源代码更改后重启容器即可生效
- ✅ 配置简单：单阶段构建，易于理解和维护
- ✅ 稳定运行：使用 `node` 直接运行打包文件，避免 `smithery dev` 的交互式问题

**注意**：
- 首次启动需要额外 5-10 秒构建时间
- 镜像包含完整的 devDependencies（用于 smithery build）

## 安全建议

1. **不要在 Dockerfile 中硬编码敏感信息**
2. **使用环境变量或 Docker secrets** 管理 API token
3. **定期更新基础镜像** 以获取安全补丁
4. **以非 root 用户运行**（已配置）
5. **扫描镜像漏洞**：`docker scan maiga-mcp:latest`

## 监控和日志

### 使用 Docker stats 监控资源

```bash
# 实时监控
docker stats maiga-mcp-server

# docker-compose 方式
docker-compose stats
```

### 配置日志驱动

在 `docker-compose.yml` 中添加：

```yaml
services:
  maiga-mcp:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 更多信息

详细文档请参阅：
- [README.md](./README.md) - 完整项目文档
- [Dockerfile](./Dockerfile) - 镜像构建配置
- [docker-compose.yml](./docker-compose.yml) - 编排配置
