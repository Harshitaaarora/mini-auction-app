# ---------- Build frontend ----------
FROM node:20-alpine AS build-frontend
WORKDIR /app
COPY client/package*.json client/
RUN cd client && npm ci
COPY client client
RUN cd client && npm run build

# ---------- Build backend ----------
FROM node:20-alpine AS build-backend
WORKDIR /app
COPY server/package*.json server/
RUN cd server && npm ci
COPY server server

# copy frontend build into backend public dir
RUN mkdir -p server/public && cp -r client/dist/* server/public/ || true
RUN cd server && npm run migrate || true

# ---------- Run image ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build-backend /app/server ./server
EXPOSE 8080
CMD ["node", "server/src/server.js"]
