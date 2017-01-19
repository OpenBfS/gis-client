#!/bin/bash -e

CUR_DIR=`pwd`
WORKSPACE=$CUR_DIR
SCRIPT_DIR=`dirname $0`
SENCHA_CMD_VERSION="6.2.1"
SENCHA_CMD_MINOR_VERSION="6.2.1.29"
SENCHA_WS="/sencha-ws"
BASIGX_HASH="daf2442"

cd $SCRIPT_DIR
wget http://cdn.sencha.com/cmd/$SENCHA_CMD_VERSION/no-jre/SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh.zip
unzip SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh.zip
./SenchaCmd-$SENCHA_CMD_MINOR_VERSION-linux-amd64.sh -q -dir "/opt/$SENCHA_CMD_MINOR_VERSION"

SENCHA_CMD="/opt/$SENCHA_CMD_MINOR_VERSION/sencha"
CONFIG="gis_client_configs"

$SENCHA_CMD -sdk $WORKSPACE/src/ext generate workspace $SENCHA_WS
$SENCHA_CMD package repo init -name "terrestris GmbH & Co. KG" -email "info@terrestris.de"
$SENCHA_CMD package repo add GeoExt http://geoext.github.io/geoext3/cmd/pkgs
cd $SENCHA_WS/packages/
git clone https://github.com/terrestris/BasiGX.git
cd BasiGX/
git checkout $BASIGX_HASH
$SENCHA_CMD package upgrade
$SENCHA_CMD package list
$SENCHA_CMD package build


cd $WORKSPACE/src/
$SENCHA_CMD package list
$SENCHA_CMD package remove GeoExt
$SENCHA_CMD package remove BasiGX
$SENCHA_CMD package list
$SENCHA_CMD package repo add GeoExt http://geoext.github.io/geoext3/cmd/pkgs
$SENCHA_CMD package add $SENCHA_WS/build/BasiGX/BasiGX.pkg
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
