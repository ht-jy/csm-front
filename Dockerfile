# Step 1: Build the React app
FROM node:22.11.0 AS build-stage

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy project files (ignoring files in .dockerignore)
COPY . .
# Build the app for production
RUN npm run build:prod

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
