# Dockerfile for Next.js Application

# 1. Base Image: Use an official Node.js image.
# Using a specific version is recommended for production for consistency.
FROM node:18-alpine AS base

# 2. Set Working Directory
WORKDIR /app

# 3. Install Dependencies
# First, copy over package.json and lock files to leverage Docker cache.
COPY package*.json ./
RUN npm install

# 4. Copy Application Code
# Copy only the necessary files for the build to optimize caching.
COPY app ./app
COPY components ./components
COPY config ./config
COPY constants ./constants
COPY public ./public
COPY utils ./utils
COPY styles ./styles
COPY next.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./


# 5. Build the Application
# This command runs the `next build` script from your package.json.
RUN npm run build

# 6. Production Image
# Create a smaller, more secure production image.
FROM node:18-alpine AS production

WORKDIR /app

# Copy the built application from the 'base' stage.
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public

# 7. Expose Port and Start the Application
# Expose the port the app will run on (default for Next.js is 3000).
EXPOSE 3000

# This command runs the `next start` script from your package.json.
CMD ["npm", "start"]
