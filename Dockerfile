# make build
FROM denoland/deno:latest AS build

WORKDIR /app
COPY . .

RUN deno install --allow-scripts

# configure variables and their default values
ARG VITE_COMMIT_HASH=unknown VITE_TARGET_YEAR=2025 VITE_SHOW_PLACEHOLDER=false
# allow overwriting them at build time
ENV VITE_COMMIT_HASH=$VITE_COMMIT_HASH VITE_TARGET_YEAR=$VITE_TARGET_YEAR VITE_SHOW_PLACEHOLDER=$VITE_SHOW_PLACEHOLDER

RUN deno task build


# host
FROM nginx:alpine
# this image is used to serve the static files, without any nodejs dependency
COPY --from=build /app/build /usr/share/nginx/html
# nginx defaults to port 80
