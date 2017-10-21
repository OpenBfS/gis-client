#!/bin/bash -e

CUR_DIR=`pwd`
WORKSPACE=$CUR_DIR
#SENCHA_CMD_VERSION="6.5.2.15"
SENCHA_CMD_VERSION="6.2.2.36"
EXTJS_VERSION="6.2.0"

ls -hal && ls -hal src/lib/*

if [ ! -e SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh.zip ]
then
  wget http://cdn.sencha.com/cmd/$SENCHA_CMD_VERSION/no-jre/SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh.zip
fi

unzip SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh.zip
./SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh -q -dir "/opt/$SENCHA_CMD_VERSION"

if [ ! -e ext-$EXTJS_VERSION-gpl.zip ]
then
  wget http://cdn.sencha.com/ext/gpl/ext-$EXTJS_VERSION-gpl.zip
fi

unzip ext-$EXTJS_VERSION-gpl.zip

SENCHA_CMD="/opt/$SENCHA_CMD_VERSION/sencha"

cd $WORKSPACE/src/

$SENCHA_CMD app upgrade $WORKSPACE/ext-$EXTJS_VERSION
$SENCHA_CMD app install --framework=ext
$SENCHA_CMD app clean
$SENCHA_CMD app build

ln -sf $WORKSPACE/src/build/production/Koala $WORKSPACE/webgis

#$SENCHA_CMD app watch

cd $WORKSPACE
