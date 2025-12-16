FROM node:20-alpine as build

# initialize/override global scope build args by supplying --build-arg flag in podman build
ARG FRONTEND_VERSION
ARG BACKEND_PORT
ARG BACKEND_PROTOCOL
ARG BACKEND_DOMAIN
ARG ENVIRONMENT
ARG NGINX_CONF

### INITIAL SETUP ###
WORKDIR /build-dir/
COPY package-lock.json package.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY public/ ./public/
COPY index.html ./
COPY .eslintrc.js ./
COPY src/ ./src

### NPM INSTALL & BUILD ###
# Consume the ARGS to make them available in subsequent stages
ARG FRONTEND_VERSION
ARG BACKEND_PORT
ARG BACKEND_PROTOCOL
ARG BACKEND_DOMAIN
ARG ENVIRONMENT
ARG NGINX_CONF
# bakes env vars into compiled js files
ENV VITE_BUILD_VERSION=$FRONTEND_VERSION
ENV VITE_BACKEND_PORT=$BACKEND_PORT
ENV VITE_BACKEND_PROTOCOL=$BACKEND_PROTOCOL
ENV VITE_BACKEND_DOMAIN=$BACKEND_DOMAIN
ENV VITE_ENVIRONMENT=$ENVIRONMENT
RUN npm ci --only=production
RUN npm run build

#   __   ___  __        ___           ___               __
#  /__` |__  |__) \  / |__     |  | |  |  |__|    |\ | / _` | |\ | \_/
#  .__/ |___ |  \  \/  |___    |/\| |  |  |  |    | \| \__> | | \| / \
# Use the official unprivileged nginx image (runs as nginx user by default)
FROM docker.io/nginxinc/nginx-unprivileged:1.29.3-alpine
WORKDIR /etc/nginx

# construct minimum viable final container from build stage
COPY --from=build /build-dir/dist /usr/share/nginx/html
# redeclare arg to expose in stage
ARG NGINX_CONF
COPY $NGINX_CONF /etc/nginx/nginx.conf

# Change Ownership of directories to unpriviledged user
USER root
RUN mkdir -p /run/nginx /var/log/nginx /var/cache/nginx/c /etc/nginx/certs/
RUN chown -R nginx:nginx /run/nginx /var/log/nginx /var/cache/nginx/c /etc/nginx/certs/
USER nginx

# HTTP/S Ingress
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]