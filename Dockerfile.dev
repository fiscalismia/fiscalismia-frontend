FROM node:20.12.2-alpine3.19
WORKDIR /fiscalismia-frontend/
COPY ./public/ ./public
COPY index.html LICENSE vite.config.ts package-lock.json package.json tsconfig.json ./
RUN npm install
ENTRYPOINT ["npm", "run", "host"]
# tests folder later for workflow

# docker build --pull --no-cache --rm -f "Dockerfile" -t fiscalismia-frontend:latest "."
# docker run --network fiscalismia-network -v %cd%\src:/fiscalismia-frontend/src --env-file .env --rm -it -p 3001:3001 --name fiscalismia-frontend fiscalismia-frontend:latest