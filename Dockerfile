FROM node:alpine AS build
WORKDIR /build
COPY package*.json ./
RUN npm install

ARG VITE_COMMIT_HASH=unknown VITE_TARGET_YEAR=2025 VITE_SHOW_PLACEHOLDER=false
ENV VITE_COMMIT_HASH=$VITE_COMMIT_HASH VITE_TARGET_YEAR=$VITE_TARGET_YEAR VITE_SHOW_PLACEHOLDER=$VITE_SHOW_PLACEHOLDER

COPY . ./
RUN npm run build


FROM nginx:alpine
COPY --from=build /build/dist /usr/share/nginx/html
