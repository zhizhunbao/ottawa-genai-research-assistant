# 使用 Node.js 24.8.0 作为基础镜像
FROM node:24.8.0-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 使用 nginx 来服务静态文件
FROM nginx:alpine

# 复制构建的文件到 nginx
COPY --from=0 /app/build /usr/share/nginx/html

# 复制 nginx 配置（可选，使用默认配置）
# COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口 80
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"] 