# Stage 1: Build the React application
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency definitions and install them
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files and build the app
COPY . .
RUN npm run build


# Stage 2: Serve the built static files with Nginx
FROM nginx:alpine AS production

# Copy the built static files from Stage 1 to Nginx's public directory
# CRA outputs to "build" (Vite would be "dist")
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx listens on 80 inside the container; map it to a host port with
# `docker run -p 3000:80 ...` (EXPOSE only documents the container port)
EXPOSE 80

# Run Nginx in the foreground so the container stays up
CMD ["nginx", "-g", "daemon off;"]