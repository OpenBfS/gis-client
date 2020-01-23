***************************************************************
Documentation for running gis-client locally with customized data 
***************************************************************

1. 	For cloning the repository  see /gis-client/README.md "Quelltext/Code"

2. 	Install Sencha CMD, EXT JS, npm

	cd src/
	ln -s <Pfad zu ExtJS>/ext-6.2.0 ext
	sencha app install --framework=ext
	# d3-utils bauen
	cd resources/lib/d3-util
	npm install
	npm run build:dist
	cd ../../..

3. 	Bulid application
 	
	[first time build]
	sencha app clean
	sencha app build
	[for development] (default localhost:1841)
	sencha app watch

4. 	Edit gis-client/src/index.html to access local appContext.json

        	Line 54: Koala.appContextUrl = "resources/appContext3.json";
        	Line 55: //Koala.appContextUrl = window.location.protocol + "//" + window.location.hostname + "/gis_client_configs/appContext.json";

5. 	Change references (URLs) in gis-client/src/resources/appContext.json to local resources

	[Example]

    "urls": {
        "geoserver-base-url": "http://localhost:8082/geoserver/gwgisws/", 
        "irix-servlet": "https://www.imis.bfs.de/irix/irix-client/IRIXClient", 
        "layerprofile": "classic/resources/layerprofile.json", 
        "layerset": "classic/resources/layerset.json", 
        "metadata-search": "/resources/", 
        "metadata-xml2json": "/resources/", 
        "print-servlet": "https://www.imis.bfs.de/print/gis/print/", 
        "spatial-search": "https://www.imis.bfs.de/ogc/opendata/ows"
      }, 

6. 	Metadata-files from BfS-server for all layers cannot be accessed
	create local metadata-files, example for baselayers can be found at gis-client/src/resources/1234a

7.	For using GeoServer to serve own data to the application, refer to gis-client/GWGIS_GeoServer_README.md

8.	As example for a local metadata-file for a data-layer, refer to gis-client/src/resources/rain_meta
	Important things to change:
		- WMS and WFS base-urls
		- GetFeature and GetLegend request-urls
		- name of the file
		- filters
		- timeSeriesChartProperty

9.	add ane of metadata file to 'mapLayers' in appContext

	[Example]

	"mapLayers": [
        {
          "uuid": "rain_meta",
	  "visible":"true"
        }
	], 

10.	to push changes to GIT-repository:
	9.1 git status
	9.2 git add (add necessary files that you changed only)
	9.3 git commit -m "[Your commit message here]"
	9.4 git push origin [branchname]

____________________________________________________________________________________________________________
Additional info

	to change the base-color of the whole application, go to
	gis-client/src/sass/var/Component_BfS.scss

	if you have more than an handful of layers you want to display, it is recommended to look into Geonetwork
	for storing your metadata files
	https://geonetwork-opensource.org/docs.html
____________________________________________________________________________________________________________










