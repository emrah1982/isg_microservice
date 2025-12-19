# ReactApp Dockerfile (Vite + TypeScript)
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production=false

# Copy source
COPY . .

# Build the app
RUN npm run build

# Expose Vite preview port
EXPOSE 5173

# Run Vite preview to serve the production build
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
