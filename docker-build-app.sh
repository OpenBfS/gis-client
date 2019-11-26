#!/bin/bash -e

CUR_DIR=`pwd`
WORKSPACE=$CUR_DIR
SENCHA_CMD_VERSION="7.0.0.40"
EXTJS_VERSION="6.2.0"

if [ ! -e SenchaCmd-${SENCHA_CMD_VERSION}-linux-amd64.sh.zip ]
then
  curl -L http://cdn.sencha.com/cmd/${SENCHA_CMD_VERSION}/no-jre/SenchaCmd-${SENCHA_CMD_VERSION}-linux-amd64.sh.zip \
       -o SenchaCmd-${SENCHA_CMD_VERSION}-linux-amd64.sh.zip
fi

unzip -nq SenchaCmd-${SENCHA_CMD_VERSION}-linux-amd64.sh.zip
./SenchaCmd-${SENCHA_CMD_VERSION}-linux-amd64.sh -q -dir "/opt/${SENCHA_CMD_VERSION}"

if [ ! -e ext-${EXTJS_VERSION}-gpl.zip ]
then
  curl -L http://cdn.sencha.com/ext/gpl/ext-${EXTJS_VERSION}-gpl.zip \
       -o ext-${EXTJS_VERSION}-gpl.zip
fi

unzip -nq ext-${EXTJS_VERSION}-gpl.zip

SENCHA_CMD="/opt/${SENCHA_CMD_VERSION}/sencha"

cd ${WORKSPACE}/src/
ln -s ${WORKSPACE}/ext-${EXTJS_VERSION} ext
${SENCHA_CMD} app install --framework=ext

cd ${WORKSPACE}/src/resources/lib/d3-util
npm install
npm run build:dist
cd ${WORKSPACE}/src/

${SENCHA_CMD} app clean
${SENCHA_CMD} app build

ln -sf ${WORKSPACE}/src/build/production/Koala ${WORKSPACE}/gis

cd ${WORKSPACE}
