FROM node:18-alpine

# Install dependencies for Playwright
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    wget

# Tell Playwright to use installed Chromium
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install app dependencies (use ci for faster, reliable installs)
RUN npm ci --verbose

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]