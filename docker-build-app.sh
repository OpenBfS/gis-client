#!/bin/bash -e

CUR_DIR=`pwd`
WORKSPACE=$CUR_DIR
SCRIPT_DIR=`dirname $0`
SENCHA_CMD_VERSION="6.1.3"
SENCHA_CMD_MINOR_VERSION="6.1.3.42"

cd $SCRIPT_DIR
wget http://cdn.sencha.com/cmd/$SENCHA_CMD_VERSION/no-jre/SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh.zip
unzip SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh.zip
./SenchaCmd-$SENCHA_CMD_MINOR_VERSION-linux-amd64.sh -q -dir "/opt/$SENCHA_CMD_MINOR_VERSION"

SENCHA_CMD="/opt/$SENCHA_CMD_MINOR_VERSION/sencha"
CONFIG="gis_client_configs"
cd $WORKSPACE/src/
$SENCHA_CMD package list
$SENCHA_CMD package remove GeoExt
$SENCHA_CMD package remove BasiGX
$SENCHA_CMD package list
$SENCHA_CMD package repo add GeoExt http://geoext.github.io/geoext3/cmd/pkgs
$SENCHA_CMD package repo add BasiGX http://terrestris.github.io/BasiGX/cmd/pkgs
$SENCHA_CMD package list

if [ -f $WORKSPACE/$CONFIG/appContext.json ]; then
    cp $WORKSPACE/$CONFIG/appContext.json $WORKSPACE/src/resources/
fi

if [ -f $WORKSPACE/$CONFIG/layerprofile.json ]; then
    cp $WORKSPACE/$CONFIG/layerprofile.json $WORKSPACE/src/classic/resources/
fi

if [ -f $WORKSPACE/$CONFIG/layerset.json ]; then
    cp $WORKSPACE/$CONFIG/layerset.json $WORKSPACE/src/classic/resources/
fi

$SENCHA_CMD app clean
$SENCHA_CMD app upgrade
$SENCHA_CMD app build

ln -sf $WORKSPACE/src/build/production/Koala $WORKSPACE/webgis

#$SENCHA_CMD app watch

cd $CUR_DIR
