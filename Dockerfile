# make build
FROM denoland/deno:latest AS build

WORKDIR /app
COPY . .

RUN deno install --allow-scripts
RUN deno task build



# host
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
