FROM httpd:2.4-alpine


COPY ./dist-self-host /usr/local/apache2/htdocs/
