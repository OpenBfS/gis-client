*****************************************************************
Documentation for preprocessing data and serving it via GeoServer 
*****************************************************************
____________________________________________________________________________________________________________________
Useful Hint:
	To avoid the browser to block requests to local files, add the following code in the 'web.xml' config-file of GeoServer
	make sure to restart GeoServer after 

	 <web-app>
 		 <filter>
     			 <filter-name>cross-origin</filter-name>
      			<filter-class>org.eclipse.jetty.servlets.CrossOriginFilter</filter-class>
 		 </filter>
  		<filter-mapping>
     			 <filter-name>cross-origin</filter-name>
      			<url-pattern>/*</url-pattern>
  		</filter-mapping>
 	</web-app>
____________________________________________________________________________________________________________________

1.	Create PostGIS database and add your data to it
	1.1 Try to store your data as normalized as possible
	1.2 Add primary keys and if necessary foreign keys
	1.3 If your data has a time column, make sure it is saved in 'timestamp'-format

2. 	Create a workspace in GeoServer

3. 	Connect your PostGIS database (Store)

4. 	Add new Layer to publish

5. 	Create SQL-view to join tables from your database or to select the attributes you want to display
	
	[Example]

	SELECT stations.id as id,
	stations.geom,
	stations.community,
	measurement.value,
	measurement.unit,
	measurement.timestamp as end_measure
	FROM stations
	INNER JOIN measurement ON stations.id=measurement.station_id
	ORDER BY end_measure DESC

6. 	For time-series data create another SQl-view

	[Example]

	SELECT stations.id as id,
	stations.geom,
	stations.community,
	measurement.value,
	measurement.unit,
	measurement.timestamp as end_measure
	FROM stations
	INNER JOIN measurement ON stations.id=measurement.station_id
	WHERE
	stations.id = '%locality_code%'
	ORDER BY end_measure DESC

	sql view parameter
	name: locality_code
	default value: [default value]
	Regex: []
	
	!Check unique id as Identifier!

7.	Style your data using SLD (Styled Layer Descriptor)
	Futher information on this at: https://docs.geoserver.org/stable/en/user/styling/sld/cookbook/
	remeber to add the style to your layer!

8. 	Data should now be displayed in application
	


