#!/usr/bin/env bash

function help {
    echo
    echo " Tries to grab a patch from a Github Pull request and apply it to the"
    echo " local packages folder of a Sencha app."
    echo
    echo " The positional arguments are:"
    echo
    echo "     * slug,        e.g. 'terrestris/BasiGX'"
    echo "     * pr,          e.g. 74"
    echo "     * dry-run,     e.g. false, default is true"
    echo "     * reverse,     e.g. true, default is false"
    echo
    echo " Examples:"
    echo
    echo "     ./test-patch.sh terrestris/BasiGX 74"
    echo "     ./test-patch.sh terrestris/BasiGX 74 true"
    echo "     ./test-patch.sh terrestris/BasiGX 74 false true"
    echo
    exit 0
}

# Basic checks if the number of arguments match, show help otherwise
if [ "$#" -lt 2  ]; then
    help
    exit 1
fi

if [ "$#" -gt 4  ]; then
    help
    exit 2
fi

# Capture and check the slug (first argument)
SLUG=$1
SLUG_REG_EXP='^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$'
if ! [[ $SLUG =~ $SLUG_REG_EXP ]] ; then
   echo "Slug doesn't look like a valid one (e.g. slash included?): $SLUG"
   exit 3
fi

SLUG_PARTS=(${SLUG//\// })
OWNER=${SLUG_PARTS[0]}
PACKAGE=${SLUG_PARTS[1]}


# Capture and check the Pull request number (second argument)
PR=$2
INT_REG_EX='^[0-9]+$'
if ! [[ $PR =~ $INT_REG_EX ]] ; then
   echo "Pull request specification doesn't look like a number: $PR"
   exit 4
fi

# Capture and check the dry run argument (third argument, default true)
DRYRUN=true
if [ "$3" = "false" ]; then
    DRYRUN=false
fi;

# Capture and check the reverse run argument (fourth argument, default false)
REVERSE=false
if [ "$4" = "true" ]; then
    REVERSE=true
fi;

# This is a speciality of the GeoExt3 package, the repo is named GeoExt3, but
# the package it provides is 'GeoExt'.
if [ "$PACKAGE" = "GeoExt3" ]; then
    PACKAGE=GeoExt
fi;


# From the gathered information we are now able to determine a path to the
# package in the local app:
TARGET_DIR="packages/remote/$PACKAGE"
if [ ! -d "$TARGET_DIR" ]; then
    echo "Directory $TARGET_DIR not existing"
    exit 5
fi

# This is the URL where we can get a uniied diff
URL="https://patch-diff.githubusercontent.com/raw/$SLUG/pull/$PR.diff"

# Create a temporary file
PATCHFILE=$(mktemp --suffix .patch)


echo " SUMMARY:"
echo " -------------------------"
echo " slug        = $SLUG"
echo " owner       = $OWNER"
echo " package     = $PACKAGE"
echo " PR          = $PR"
echo " target dir  = $TARGET_DIR"
echo " reverse?    = $REVERSE"
echo " dryrun?     = $DRYRUN"
echo " patch-URL   = $URL"
echo " patch-file  = $PATCHFILE"


echo
echo "If the above summary looks OK, please enter 'y' below to continue."
echo "Any other input will abort the script"
echo
echo -n "Continue? [n]: "

read ok

if [ "$ok" != "y" ]; then
    echo
    echo "Abort"
    echo
    exit 0
fi

# ------------------------------------------------------------------------------

echo " 1) Getting patch…"
wget $URL -q -O $PATCHFILE
echo

echo " 2) Switching directory…"
pushd $TARGET_DIR
echo

echo " 3) Creating basic patch options…"
OPTS="--unified --strip 1 --fuzz 1 --input $PATCHFILE"
echo

if [ $DRYRUN = true ]; then
    echo "    * add '--dry-run' flag…"
    OPTS="--dry-run $OPTS"
    echo
fi

if [ $REVERSE = true ]; then
    echo "    * add '--reverse' flag…"
    OPTS="--reverse $OPTS"
    echo
fi

echo " 4) Actually patch…"
patch $OPTS
echo

echo " 5) Switching directory back…"
popd
echo

echo " …done"
exit 0
