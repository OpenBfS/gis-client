#!/bin/bash -e

CUR_DIR=`pwd`
WORKSPACE=$CUR_DIR
SENCHA_CMD_VERSION="6.2.1.29"
EXTJS_VERSION="6.2.0"

wget http://cdn.sencha.com/cmd/$SENCHA_CMD_VERSION/no-jre/SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh.zip
unzip SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh.zip
./SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh -q -dir "/opt/$SENCHA_CMD_VERSION"
wget http://cdn.sencha.com/ext/gpl/ext-$EXTJS_VERSION-gpl.zip
unzip ext-$EXTJS_VERSION-gpl.zip

SENCHA_CMD="/opt/$SENCHA_CMD_VERSION/sencha"

cd $WORKSPACE/src/

$SENCHA_CMD app upgrade $WORKSPACE/ext-$EXTJS_VERSION
$SENCHA_CMD app clean
$SENCHA_CMD app build

ln -sf $WORKSPACE/src/build/production/Koala $WORKSPACE/webgis

#$SENCHA_CMD app watch

cd $WORKSPACE
