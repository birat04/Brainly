# Dockerfile

# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (to leverage Docker cache)
COPY package*.json tsconfig.json ./

# Install production dependencies
RUN npm install

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Expose backend port
EXPOSE 3000

# Start the server
CMD ["npm","run","start"]
