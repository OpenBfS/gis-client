# Konfigurations-Dateien {#configfiles}

Um die gesamte Applikation zu konfigurieren existieren vier Dateien, die im
Folgenden erläutert werden.

## appContext.json {#appcontext}

In der Datei `appContext.json` werden verschiedene Werte gesetzt, die vom
Client-Code ausgelesen werden die sich ggf verändern können. So muss z.B. der
Client-Code nicht neu kompiliert werden, sollte sich die url des print-servlets
ändern.

* **urls**

  Objekt das verschiedene Urls enthält, die vom Client angesprochen werden.
  * **metadata-xml2json**

    Url der xml2json-Schnittstelle des verwendeten GeoNetwork-Servers.
  * **metadata-search**

    Url der CSW-Schnittstelle des verwendeten GeoNetwork-Servers.
  * **spatial-search**

    Url der OWS-Schnittstelle des verwendeten GeoServers.
  * **print-servlet**

    Url der Print-Schnittstelle des verwendeten print-servlets.
  * **irix-servlet**

    Url des irix-servlet.
  * **rodos-projects**

    Url der projects-Schnittstelle des RODOS-servlets.
  * **rodos-results**

    Url der results-Schnittstelle des RODOS-servlets. Ggf. identisch mit **rodos-projects**
  * **layerprofile**

    Url/Pfad zur Datei **layerprofile.json**. Siehe unten.
  * **layerset**

    Url/Pfad zur Datei **layerset.json**. Siehe unten.
  * **print-transparent-img**

    Url zu einer transparenten Datei die für den Druck verwendet wird falls
    bestimmte Elemente nicht dargestellt werden sollen.

* **application_user**

  Enthält die Konfigruation für den **application_user**, die unter Anderem dazu verwendet
  wird sich gegenüber des GeoNetworks zu authentifizieren um eine Metadatensuche
  durchzuführen.
  * **username**

    Der Username des **application_user**s.
  * **password**

    Das Passwort des **application_user**s.

* **imis_user**

  Enthält die Konfigruation für den **imis_user**, die unter Anderem dazu verwendet
  wird zu prüfen, ob initial die Hilfe angezeigt werden soll.
  * **imis_roles**

    Ein Array von Imis-Rollen die der **imis_user** inne hat.
  * **uid**

    Die user id des **imis_user**s.
  * **username**

    Der Username des **imis_user**s.
  * **userroles**

  Ein Array von User-Rollen die der **imis_user** inner hat.

* **print-timeout**

  Die maximale Zeit, die das Print-Servlet zum erstellen des Drucks aufwenden
  darf. (in Millisekunden)

* **metadataSearchFields**

  Ein Array von Attribut-Feldern über die, die Metadatensuche durchgeführt soll.

* **spatialSearchTypeName**

  Der Name des Layers im GeoServer über den die räumliche Suche durchgeführt werden
  soll.

* **spatialSearchFields**

  Enthält die Konfiguration für die verwendeten Felder der räumlichen Suche.
  * **searchColumn**

    Gibt an über welches Feld die räumliche Suche durchgeführt werden soll.
  * **geomColumn**

    Gibt an welches Feld die Geometrie der Ergebnisse der räumlichen Suche enthält.

* **startCenter**

  Zentrums-Koordinaten der Startansicht der Applikation. Bitte verwendete Projektion
  unter **mapConfig.projection** berücksichtigen.

* **startZoom**

  Zoomstufe der Startansicht der Applikation.

* **mapLayers**

  Array von GeoNetwork-Layer-UUIDs die der Applikation initial hinzugefügt werden
  sollen.

* **mapConfig**

  Enthält die Konfiguration für die Karte.

  * **projection**

    EPSG-Code der Projektion der Karte.

* **tools**

  Array von Strings, die die aktivierten Werkzeuge der Anwendung steuern.
  Mögliche Werte sind: `"printBtn"`, `"irixPrintBtn"`, `"cloneBtn"`, `"addWmsBtn"`, `"importVectorLayerBtn"`, `"createVectorLayerBtn"`, `"drawBtn"`, `"measureBtn"`, `"selectFeaturesBtn"`, `"classicRoutingBtn"`, `"fleetRoutingBtn"`

* **vectorIcons**

  Array von Objekten die Icons für den Styler konfigurieren. Ein Objekt besteht
  aus `src` (Pfad zum Icon) und `caption` (Titel).

* **vectorProjections**

  Array von Objekten die angeben in welcher Projektion lokale Vektor-Daten
  importiert werden können. Ein Objekt besteht aus `code` (EPSG:Code) und `label`
  (Anzeigename).

* **vectorTemplates**

  Array von Objekten die angeben welche GeoNetwork-Layer als Template für lokale
  Vektor-Daten verwendet werden können. Ein Objekt besteht aus `uuid`
  (UUID des GeoNetwork-Layers) und `label` (Anzeigename).

* **wmsUrls**

  Array von Service-URLs die vom *Add WMS Tool* verwendet werden. Die URL sollte
  dabei einer Basis URL eines KartenServers entsprechen.

* **redLineLayerName**

  Der Name des Zeichen Layers wie er im RoutingLegendTree zu lesen ist.

* **rodosFolderName**

  Der Name des RODOS-Ordners im Themenbaum. Dieser muss mit dem name des
  RODOS-Ordners in der layerSet.json übereinstimmen.

* **routing**

  Konfigurationen rund um den OpenRouteService. Beispiel Konfiguration weiter unten.

  * **openrouteserviceUrl** 

    Die URL zur OpenRouteService Instanz.

  * **vroomUrl**

    Die URL zum VROOM Service.

  * **photonUrl**

    Die URL zum Photon Service.

  * **routeStyle**

    Styling Optionen des Layers, der die berechnete Route darstellt.

    * **colorPrimary**

      Primäre Farbe der Route.

    * **colorSecondary**

      Sekundäre Farbe der Route.

    * **width**

      Breite der Route.
  
  * **routeSegmentStyle**

    Styling Optionen des Layers, der die einzelnen Routensegmente darstellt.

    * **color**

      Farbe des Routensegments.
    
    * **width**

      Breite des Routensegments.

  * **waypointStyle**

    Styling Optionen des Layers, der die einzelnen Wegpunkte darstellt.

    * **markerSize**

      Größe der Wegpunkte in Pixeln.

    * **color**

      Farbe der Wegpunkte.

  * **jobMarkerStyle**

    Styling Optionen des Layers, der die einzelnen Aufträge ("jobs") darstellt.

    * **markerSize**

      Größe des Markers in Pixeln.
      Default ist: 38

    * **color**

      Farbe des Markers. 
      Default ist: 'black'

    * **colorUnassigned**

      Farbe des Markers, wenn der Job nicht erfüllt werden konnte. 
      Default ist: 'gray'

  * **startEndMarkerStyle**

    Styling Optionen des Layers, der die einzelnen Standorte der Fahrzeuge darstellt.

    * **markerSize**

      Größe des Markers in Pixeln.
      Default ist: 15

    * **color**

      Farbe des Markers.
      Default ist: 'black'


  * **elevationStyle**

    Styling Optionen des Layers, der die Abschnitte des Höhenprofils darstellt.

    * **fill**

      Füllfarbe des Punkts.
    
    * **stroke**

      Farbe der Umrandung des Punkts.

    * **radius**

      Radius des Punkts in Pixeln.

  * **avoidAreaStyle**

    Styling Optionen des Layers, der die Avoid Areas darstellt.

    * **strokeColor**

      Farbe der Umrandung der Avoid Area.

    * **width**

      Breite der Umrandung der Avoid Area.

    * **fillColor**

      Füllfarbe der Avoid Area.
    
    * **opacity**

      Deckkraft der Avoid Area.

  * **fleetRouting**

    Konfigurationen des FlottenRoutings.

    * **job**

      Konfigurationen der Aufträge.

      * **maxServiceDuration**

      Maximale Dauer in Sekunden, die ein einzelner Auftrag vor Ort dauern kann.
      Default: 24h

    * **vehicle**

      Konfigurationen der Fahrzeuge.

      * **maxBreakDuration**

      Maximale Dauer in Sekunden, die eine einzelne Pause dauern kann.
      Default: 24h

  ```json
  {
    "routing": {
        "openrouteserviceUrl": "https://entw-imis.lab.bfs.de/ors",
        "photonUrl": "https://entw-imis.lab.bfs.de/photon",
        "routeStyle": {
            "colorPrimary": "#ff0000",
            "colorSecondary": "#BDBDBD",
            "width": 5
        },
        "routeSegmentStyle": {
            "color": "#ffffff",
            "width": 4
        },
        "waypointStyle": {
            "markerSize": 38,
            "color": "black"
        },
        "elevationStyle": {
            "fill": "#ffffff",
            "stroke": "#ffffff",
            "radius": 3
        },
        "avoidAreaStyle": {
            "strokeColor": "#000000",
            "width": 4,
            "fillColor": "#ff0000",
            "opacity": 0.2
        },
        "fleetRouting": {
            "job": {
                "maxServiceDuration": 86400
            },
            "vehicle": {
                "maxBreakDuration": 86400
            }
        }
    }
  }
  ```

## irixContext.json {#irixcontext}

Die Datei `irixContext.json` enthält die Konfiguration des Formulars, das – zusätzlich
zum existierenden DruckFormular – an das Irix-Print-Servlets übermittelt wird.

* **fields**

  Enthält ein Array von Konfigurationsobjekten für Formularfelder.
  Die Konfigurationsobjekte bestehen aus mehreren Attributen:
  * **type**

    Gibt den Typen des Formularfelds an. Mögliche werte sind:
    * `"text"`: Ein Feld zur Eingabe von Text.
    * `"combo"`: Ein Auswahlfeld verschiedener Werte.
    * `"datetime"`: Ein Feld zur Auswahl von Datum und Uhrzeit.
    * `"fieldset"`: Ein Container für Felder beliebigen Typs.

  * **name**

    Identifikator des Formularfelds. **name** gibt auch an unter welche Key der
    Wert des Feldes an das irix-servlet geschickt wird.
  * **label**

    Das Label für das entsprechende Formularfeld.
  * **defaultValue**

    Der Default-Wert der zu Beginn im Formularfeld angezeigt werden soll.
  * **allowBlank**

    Gibt an ob das Feld leer bleiben darf (`true`) oder ausgefüllt werden muss
    (`false`).
  * **values** (nur für **type** `"combo"`)

    Ein zweidimensionales Array das die möglichen Werte einer ComboBox angibt.
    Die Arrays der zweiten Dimension bestehen dabei aus dem tatsächlichen Werte,
    der an das servlet geschickt wird an erster Stelle und dem Anzeigenamen an
    zweiter Stelle. z.b.: `["Emergency", "Notfall"]`
    In diesem Fall wird "Emergency" an das Servlet gesendet, wenn "Notfall"
    ausgewählt wird.
  * **fields** (nur für **type** `"fieldset"`)

    Ein Array von **fields** Objekten.

## layerprofile.json {#layerprofile}

  Die Datei `layerprofile.json` enthält die Konfiguration der Layer Profilwahl.
  Sie besteht aus einem Array von Konfigurationsobjekten mit folgenden Attributen:

  * **isLayerProfile**

    Sollte in der Datei `layerprofile.json` immer auf `'true'`  stehen.
  * **text**

    Der Text, der für das entsprechenden Layerprofil angezeigt werden soll.
  * **thumb**

    Pfad zum Symbol, das für das entsprechenden Layerprofil angezeigt werden soll.
  * **children**

    Ein Array von Konfigurationsobjekten für Treenodes.

    * **leaf**

      Gibt an, ob es sich um einen Layer (`true`) oder einen Ordner (`false`)
      handelt.
    * **text**

      Der Layer-/Ordnername.
    * **visible**

      Gibt an, ob der Layer/Ordner inital sichtbar gestellt werden soll.
    * **uuid**

      Die UUID des Layers im GeoNetwork.

## layerset.json {#layerset}

  Die Datei `layerset.json` enthält die Konfiguration für die Layerset Auswahl
  bzw. den Themenbaum. Sie besteht aus einem Array von Konfigurationsobjekten
  mit folgenden Attributen:

  * **isLayerProfile**

    Sollte in der Datei `layerset.json` immer auf `'false'`  stehen.
  * **text**

    Der Text, der für das entsprechenden Layerprofil angezeigt werden soll.
  * **thumb**

    Pfad zum Symbol, das für das entsprechenden Layerprofil angezeigt werden soll.
  * **children**

    Ein Array von Konfigurationsobjekten für Treenodes.

    * **leaf**

      Gibt an, ob es sich um einen Layer (`true`) oder einen Ordner (`false`)
      handelt.
    * **text**

      Der Layer-/Ordnername.
    * **visible**

      Gibt an, ob der Layer/Ordner inital sichtbar gestellt werden soll.
    * **uuid**

      Die UUID des Layers im GeoNetwork.
