#
# Build and run gis-client
#
# Build with e.g. `docker build --force-rm=true -t bfs/gis_client .'
# Run from the repository root-dir with e.g.
# `docker run --name gis_client -p 8080:80 -d bfs/gis_client'
#
# The GIS-application will be available under http://yourdockerhost:8080
#

FROM httpd:2.4
MAINTAINER mlechner@bfs.de

ENV DEBIAN_FRONTEND noninteractive

#
# Install dependencies
#

RUN apt-get update -y && apt-get install -y --no-install-recommends \
    curl unzip git openjdk-7-jre && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ADD . /usr/local/apache2/htdocs/
WORKDIR /usr/local/apache2/htdocs/

# add custom appContext.json if available at ./
RUN if [ -f ./appContext.json ]; then mv ./src/resources/appContext.json ./src/resources/appContext.json.orig && mv ./appContext.json ./src/resources/ ; fi

#
# Install dependencies
#
RUN ./docker-build-app.sh

#
# httpd setup
#
RUN ln -sf $PWD/custom-httpd.conf $HTTPD_PREFIX/conf/httpd.conf
RUN ln -sf $PWD/custom-vhosts.conf $HTTPD_PREFIX/conf/extra/httpd-vhosts.conf

CMD ["httpd-foreground"]

