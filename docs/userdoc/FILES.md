# Konfigurations-Dateien {#configfiles}

Um die gesamte Applikation zu konfigurieren existieren vier Dateien, die im
Folgenden erläutert werden.

## appContext.json {#appcontext}

In der Datei *appContext.json* werden verschiedene Werte gesetzt, die vom
Client-Code ausgelesen werden die sich ggf veränder können. So muss z.B. der
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
  Mögliche Werte sind: `'addWmsBtn'`, `'printBtn'`, `'importLocalDataBtn'`

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

## irixContext.json {#irixcontext}
## layerprofile.json {#layerprofile}
## layerset.json {#layerset}
