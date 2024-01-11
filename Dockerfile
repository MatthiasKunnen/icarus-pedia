# Dockerfile for frontend, for backend dockerfile see api/Dockerfile
FROM nginx:1.25.3
LABEL org.opencontainers.image.source=https://github.com/MatthiasKunnen/icarus-pedia

COPY ./nginx.conf /etc/nginx/nginx.conf

ARG REVISION
ENV REVISION=$REVISION
LABEL org.opencontainers.image.revision=$REVISION

LABEL org.opencontainers.image.description="The frontend for IcarusPedia"
LABEL org.opencontainers.image.title="IcarusPedia's frontend"

WORKDIR /usr/share/nginx/html

COPY ./build ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
