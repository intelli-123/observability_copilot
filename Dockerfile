# === Base stage: build ===
FROM node:22.17.0-alpine3.22 AS base

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN echo "📦 Installing dependencies..." && npm install

# Copy rest of the application code
COPY . .

# Debug: list contents
RUN echo "📁 Files in /app:" && ls -al

# Debug: check node and npm versions
RUN echo "🐢 Node version: $(node -v)" && echo "📘 NPM version: $(npm -v)"

# Build Next.js app
RUN echo "🐢 Building the application..." && npm run build

# === Production stage: run ===
FROM node:22.17.0-alpine3.22 AS production

WORKDIR /app

# Copy necessary files from build stage
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

RUN echo "🔍 Checking if next is available:" && ls -l node_modules/.bin/next

# Debug: confirm copied files
RUN echo "✅ Production image files:" && ls -al

# Expose Next.js port
EXPOSE 3000
# Start the app
CMD ["npm", "start"]
