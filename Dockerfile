# ---- build ----
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- runtime ----
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=build /app/dist ./dist
# Hugging Face Spaces (Docker) requires the container to listen on 7860;
# the app reads process.env.PORT, so set PORT=7860 in the Space variables.
EXPOSE 7860
CMD ["node", "dist/demo/main.js"]
