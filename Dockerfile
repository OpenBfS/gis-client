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

RUN apt-get update -y && apt-get install -y wget unzip openjdk-7-jre mercurial

ADD . /usr/local/apache2/htdocs/
WORKDIR /usr/local/apache2/htdocs/

#
# Optional clone Repo with custom configs into gis_client_configs at htdocs
#

RUN hg clone https://redmine-koala.bfs.de/hg/gis_client_configs gis_client_configs

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

