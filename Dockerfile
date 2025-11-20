# Build stage for Frontend
FROM node:20-alpine as build-stage
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
COPY --from=build-stage /app/client/dist ./client/dist

EXPOSE 3000
CMD ["node", "server.js"]
