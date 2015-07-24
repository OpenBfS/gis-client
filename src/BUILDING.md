# Building the application with Sencha Cmd

## Prerequisites

* Sencha Cmd v6.0.0.154 (from the first ExtJS 6 beta release)
* git
* wget (or an alternative)
* unzip

## Create a local sencha workspace

    sencha -sdk /path/to/ext-n.n.n generate workspace /path/to/workspace

/path/to/ext-n.n.n should be the path to the ExtJS 6 (beta) release, e.g. 
/path/to/ext-6.0.0.415.

## Initialize the local "GeoExt Contributors" repository

    sencha package repo init -name "GeoExt Contributors" -email "dev@geoext.org"

## Get recent versions of base packages

Inside of the workspace build the packages of the dependencies GeoExt and 
basepackage. We recommend building from the folder 

    /path/to/workspace/packages

### GeoExt

Please do NOT use the 'official' repository at 

    http://geoext.github.io/geoext3/cmd/pkgs

…it is only updated every now and then, and sometimes out of date.

Instead install the package from the git repository of GeoExt:

    cd /path/to/workspace/packages
    git clone https://github.com/geoext/geoext3.git GeoExt
    cd GeoExt
    sencha package build
    sencha package add /path/to/workspace/build/GeoExt/GeoExt.pkg

### basepackage

The basepackage is a development of terrestris, which must be downloaded from a
remote resource as zip-file:

    cd /path/to/workspace/packages 
    wget http://www.webmapcenter.de/bfs/basepackage.zip
    unzip basepackage.zip
    cd basepackage
    sencha package build
    sencha package add /path/to/workspace/build/basepackage/basepackage.pkg

## Refresh the application

If existing from a previous build, remove the folders 
 
* packages/remote/GeoExt
* packages/remote/basepackage

These represent the resolved dependencies of the application. If you know that
the packages have changed, you'll need to manually remove these so that new
build commands need to fetch the latest versions.

Once we have fixed versions for our dependencies, this step will become
obsolete, as we'll simply require the updated / newly tagged versions.

Next, issue

    sencha app refresh

This will grab the dependencies from the repository and put them into the
packages/remote folder.

Stripped example output:

    [INF] Package is already local: GeoExt/3.0.0
    [INF] Extracting  : ....................
    [INF] Package is already local: basepackage/1.0.0.001
    [INF] Extracting  : ....................


## Building the application

The application can then be build, e.g. by running

    sencha app build

or
 
    sencha app watch


