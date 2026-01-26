# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies using npm ci for deterministic builds
# Use taobao registry for speed if needed, or default
RUN npm config set registry https://registry.npmmirror.com
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Add WASM mime type to global config
RUN sed -i 's/application\/wasm.*;//; s/}/    application\/wasm wasm;\n}/' /etc/nginx/mime.types

# Copy build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
