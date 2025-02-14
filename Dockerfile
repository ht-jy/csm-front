# Step 1: Build the React app
FROM node:22.11.0 AS build-stage

# Set working directory
WORKDIR /app

# Use faster npm registry to avoid slow network issues
RUN npm config set registry https://registry.npmjs.org/

# Copy package.json and package-lock.json first (to optimize build caching)
COPY package.json package-lock.json ./

# Clean npm cache to avoid slow installs
RUN npm cache clean --force

# Install dependencies using npm ci for a clean install (with verbose logs)
RUN NODE_OPTIONS="--max-old-space-size=4096" npm ci --verbose --legacy-peer-deps

# Copy the rest of the project files (ignoring files in .dockerignore)
COPY . .

# Build the React app
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build:prod

# Step 2: Serve with NGINX
FROM nginx:stable-alpine AS production-stage

# Copy built files to NGINX's default directory
COPY --from=build-stage /app/build /usr/share/nginx/html

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
	