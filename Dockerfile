# Node.js backend for Lotaya AI
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies first
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose port for Cloud Run
EXPOSE 8080

# Command to run backend
CMD ["node", "index.js"]
