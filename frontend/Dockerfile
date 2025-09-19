# 使用 Node.js 18.17.0 作为基础镜像
FROM node:18.17.0-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 复制源代码
COPY . .

# 接收构建时的环境变量
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_API_STRATEGY

# 设置环境变量供构建使用
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_API_STRATEGY=$REACT_APP_API_STRATEGY

# 构建应用
RUN npm run build

# 使用 nginx 来服务静态文件
FROM nginx:alpine

# 复制构建的文件到 nginx
COPY --from=0 /app/build /usr/share/nginx/html

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口 80
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"] 