FROM node:18-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./

FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3003
CMD ["npm", "run", "start:dev"]

FROM base AS production
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build
EXPOSE 3003
CMD ["node", "dist/main"]