FROM node:24-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY index.html letter.html app.js letter.js auth.js styles.css sw.js manifest.json ./
COPY assets ./assets
COPY icons ./icons
COPY config/astra-clinicians.json config/provider-scripts.json ./config/
COPY data/meds ./data/meds

USER node
EXPOSE 8080
CMD ["node", "server/app.js"]
