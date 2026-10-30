FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends chromium ca-certificates fonts-liberation tini && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true CHROMIUM_PATH=/usr/bin/chromium WA_SESSION_PATH=/app/data/sessions
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY index.mjs message-id.mjs ./
RUN mkdir -p /app/data && chown -R node:node /app
USER node
ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["node","index.mjs"]
