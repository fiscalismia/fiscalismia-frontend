FROM node:20-alpine as build

# initialize global scope build args by supplying --build-arg flag in podman build
ARG BUILD_VERSION

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
# bakes version string into compiled JS files
ENV VITE_BUILD_VERSION=$BUILD_VERSION
RUN npm ci --only=production=false
RUN npm run build

#   __   ___  __        ___           ___               __
#  /__` |__  |__) \  / |__     |  | |  |  |__|    |\ | / _` | |\ | \_/
#  .__/ |___ |  \  \/  |___    |/\| |  |  |  |    | \| \__> | | \| / \
# Use the official unprivileged nginx image (runs as nginx user by default)
FROM nginxinc/nginx-unprivileged:1.27-alpine
WORKDIR /etc/nginx
# Consume the ARG to make it available in subsequent stages
ARG BUILD_VERSION
# Set the environment variable in the final image so Ansible can inspect it
ENV ANSIBLE_BUILD_VERSION=$BUILD_VERSION
# construct minimum viable final container from build stage
WORKDIR /etc/nginx
COPY --from=build /build-dir/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Port 80 would actually need root priviliges
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

# podman build --pull --no-cache --rm -f "Dockerfile" -t fiscalismia-frontend:latest "."
# podman run --network fiscalismia-network --env-file .env --rm -d -it -p 3001:8080 --name fiscalismia-frontend fiscalismia-frontend:latest