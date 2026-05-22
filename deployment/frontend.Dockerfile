# Use Node.js 20 alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY ./frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY ./frontend/ .

# Expose port 5173 (Vite default)
EXPOSE 5173

# Set environment variable for API URL (can be overridden at runtime)
ENV VITE_API_URL=http://backend:8000/api/v1

# Run development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]