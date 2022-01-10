# GeoNetwork {#geonetwork}

Die Layer des Geoportals werden über das GeoNetwork opensource (GNOS) konfiguriert.
Die unten stehenden Parameter beeinflussen dabei verschiedenen Aspekte wie Zugriff,
Darstellung und aktivierte Funktionalitäten.
Zudem können die anzuzeigenden Charts der Layer konfiguriert werden.

## Layer Type {#layertype}
### WMS {#layertype-wms}

*URL (bfs:URL)*

**Host** (bfs:host)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | http://bfs-docker.intranet.terrestris.de  |

**Path** (bfs:path)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | /geoserver/imis/wms?  |

**Layer** (bfs:layer)

| Typ | gco:CharacterString  |
|---------------------:|:---|
| Erlaubt Wertemenge   |   |
| Obligatorisch        | &#10003; |
| Default-Wert         |  |
| Beispiel             | imis:odl_brutto_24h  |

**Transparent** (bfs:transparent)

| Typ | gco:Boolean  |
|---------------------:|:---|
| Erlaubt Wertemenge   |  true/false |
| Obligatorisch        | &#10799; |
| Default-Wert         | false |
| Beispiel             | true  |

**Styles** (bfs:styles)

| Typ | gco:CharacterString  |
|---------------------:|:---|
| Erlaubt Wertemenge   |   |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             |   |

**Format** (bfs:format)

| Typ | gco:CharacterString  |
|---------------------:|:---|
| Erlaubt Wertemenge   | image/gif, image/png, image/jpg  |
| Obligatorisch        | &#10003; |
| Default-Wert         |  |
| Beispiel             | image/gif  |

## Download {#download}

*URL (bfs:URL)*

**Host** (bfs:host)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | http://bfs-docker.intranet.terrestris.de  |

**Path** (bfs:path)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | /geoserver/imis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=imis:odl_brutto_24h  |

**Filter Field Start** (bfs:filterFieldStart)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |  |
  | Obligatorisch        |  |
  | Default-Wert         |  |
  | Beispiel             |  |

**Filter Field End** (bfs:filterFieldEnd)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |  |
  | Obligatorisch        |  |
  | Default-Wert         |  |
  | Beispiel             |  |

## WFS {#wfs}

*URL (bfs:URL)*

**Host** (bfs:host)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | http://bfs-docker.intranet.terrestris.de  |

**Path** (bfs:path)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | /geoserver/imis/ows?  |

## Layer Filters {#filters}

### Point In Time {#filters-pointintime}

Point in time-Filter stellen den Template-Parameter currentDate
mit dem derzeitigen Wert bereit.

**Parameter** (bfs:paramName)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | end_measure  |

**Interval** (bfs:interval)

  | Typ | gco:Integer  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 24  |

**Unit** (bfs:unit)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | hours, minutes  |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | hours  |

*Min. Date (bfs:minDate)*

**Time Format** (bfs:TimeFormat)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s |

**Time** (bfs:TimeInstant)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00 |

*Max. Date (bfs:maxDate)*

**Time Format** (bfs:TimeFormat)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s |

**Time** (bfs:TimeInstant)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00 |

*Default Value (bfs:defaultValue)*

**Time Format** (bfs:TimeFormat)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s |

**Time** (bfs:TimeInstant)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00 |

**Layer name** (bfs:LayerName)

Überschreibt den Layernamen, der für distinct-wps-Requests als Layername verwendet werden soll.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | bfs:myLayer |

### Timerange {#filters-timerange}

Timerange-Filter stellen die Template-Parameter minDate und maxDate
mit den derzeitigen Werten bereit.

**Parameter** (bfs:paramName)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | end_measure  |

**Interval** (bfs:interval)

  | Typ | gco:Integer  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 24  |

**Unit** (bfs:unit)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | hours, minutes  |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | hours  |

**Max. Duration** (bfs:maxDuration)

  | Typ | gco:Integer  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |  |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 168  |

*Min. Date (bfs:minDate)*

**Time Format** (bfs:TimeFormat)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s  |

**Time** (bfs:TimeInstant)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00  |

*Max. Date (bfs:maxDate)*

**Time Format** (bfs:TimeFormat)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s  |

**Time** (bfs:TimeInstant)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00  |

*Default Start Date (bfs:defaultStartValue)*

**Time Format** (bfs:TimeFormat)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s  |

**Time** (bfs:TimeInstant)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00  |

*Default End Date (bfs:defaultEndValue)*

**Time Format** (bfs:TimeFormat)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s  |

**Time** (bfs:TimeInstant)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00  |

**Layer name** (bfs:LayerName)

Überschreibt den Layernamen, der für distinct-wps-Requests als Layername verwendet werden soll.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | bfs:myLayer |

## OpenLayers Properties {#openlayers} (bfs:olProperty)

**allowClone**

Darf der Layer geklont werden?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubte Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | false |
| Beispiel             | true |

**allowEdit**

Darf der Layer (über WFS-T) editiert werden?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubte Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | false |
| Beispiel             | true |

**allowHover**

Soll HoverInfo erlaubt werden?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**allowDownload**

Soll ein Download erlaubt werden?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**allowRemoval**

Soll das Entfernen aus dem Tree erlaubt werden?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**allowShortInfo**

Soll die Anzeige einer Kurzinfo erlaubt werden?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**allowPrint**

Soll das Drucken erlaubt werden?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**allowOpacityChange**

Soll die Opazität zur Laufzeit verändert werden dürfen?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**enableLegendCount**

Soll die Legende die Anzahl der Treffer enthalten?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | false |
| Beispiel             | true |

**filterDependencies (veraltet)**

Die Abhängigkeiten zwischen Filtern werden automatisch für alle
Filter bestimmt, indem die konfigurierten URLs für `allowedValues`
ausgewertet und die verwendeten Parameter extrahiert werden.

~~Ein JSON-Objekt, welches Abhängigkeiten zwischen Filtern modelliert.
Es werden die Aliase von Filtern auf andere gemappt. Wird dann der
Wert des value-Filters geändert, wird der Wert der allowedValues des
key-Filters neu ausgewertet, mit den aktuellen Werten aller Filter
als Kontextobjekt (mit dem Filter-Parameter als key). In diesem Beispiel
würde also eine Änderung des Stationsnamens dazu führen, dass der
Trajektorie_id-Filter neu ausgewertet würde.~~

| Typ | gco:CharacterString   |
|----------------------:|:----|
| Erlaubte Wertemenge   | Object |
| Obligatorisch         | &#10799; |
| Default-Wert          | {} |
| Beispiel              | {"Trajektorie_id": "Stationsname"} |

**alwaysOnTop**

Layer erhält initial alwaysOnTop Verhalten.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | false |
| Beispiel             | true |

**hoverTpl**

Template-String der beim Hovern über Features angezeigt wird. Werte in doppelten
eckigen Klammern werden durch Attribute des Features ersetzt. Alternativ kann eine
Funktion verwendet werden, die als Parameter das aktuelle Feature erhält und
einen Template String zurückgibt

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Template-String, eval:(anyValidFunction) returning Template-String |
| Obligatorisch        | Wenn allowHover = true |
| Default-Wert         |  |
| Beispiel             | `[[locality_name]]<br>[[end_measure]] <br>Messwert (µSv/h):[[value]]<br>` <br>oder<br> `eval:(function(feature){if (feature.get('value') && feature.get('value') < 0.05) {return 'ALARM';} else {return '[[locality_name]]<br>[[end_measure]]<br>Messwert (µSv/h): [[value]]';}})`|

**hoverstyle**

Stil, der für gehoverte Objekte verwendet werden soll.
Es kann ein String mit drei Komma separierten Werten angegeben werden: z.B.:

* “#ff00aa,circle,8”  → Farbwert der Füllung, Form, Radius
* “#ff00aa,rect,8,8”  → Farbwert der Füllung, Form, Breite, Höhe
* “#ff00aa,polygon,3” → Farbwert der Füllung, Form, Breite der Außenlinie

Alternativ kann eine Funktion angegeben werden, die diesen String auf Basis
des jeweiligen Features zurückgibt

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | String, eval:(anyValidFunction) returning valid style-string|
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | `#ff00aa,circle,8` <br>oder<br> `eval:(function(feature){if(feature.get('value') < 0.005) {return '#0000ee,circle,45';} else {return '#ff00aa,circle,10';}})` |

**hasLegend**

Flag zum de-/aktivieren der Legendengrafik.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**legendUrl**

Optionale URL zu einer Legendengrafik.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | URL-String |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | http://www.koeln.de/files/images/Karnevalstrikot_Spieler_270.jpg |

**legendHeight**

Gibt die Höhe der angefragten Legende an.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Zahl [> 0] |
| Obligatorisch        | &#10799; |
| Default-Wert         | 40 |
| Beispiel             | 120 |

**opacity**

Gibt die Opacity des Layers an.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Zahl [0 - 1] |
| Obligatorisch        | &#10799; |
| Default-Wert         | 1 |
| Beispiel             | 0.8 |

**rodosLayer**

Flag, ob der Layer ein Rodos-Layer ist.

| Typ | gco:Boolean  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true/false |
| Obligatorisch        | &#10799; |
| Default-Wert         | false |
| Beispiel             | true |

**routeId**

Id für den RoutingLegendTree. //TODO wird das noch benötigt?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | String ID |
| Obligatorisch        | &#10799; |
| Default-Wert         | inspireId |
| Beispiel             | 83cb1604-3d8c-490b-b807-5e7cb17f3b22 |

**styleReference**

GeoServer Style-Dateiname der als Vector-Style verwendet werden soll.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | String |
| Obligatorisch        | &#10799; |
| Default-Wert         | uuid des Layers |
| Beispiel             | odl_brutto.sld |

**layer_xyz**

'xyz' ist ein Platzhalter für eine opt_option eines ol.layer.Layer:

Beispiel: layer_opacity, layer_visible, layer_extent, layer_zIndex, ...

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Siehe http://openlayers.org/en/latest/apidoc/ol.layer.html  |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | Siehe http://openlayers.org/en/latest/apidoc/ol.layer.html  |

**selectStyle**

Stil, der für selektierte Objekte verwendet werden soll.
Es kann ein String mit drei Komma separierten Werten angegeben werden: z.B.:

* “#ff00aa,circle,8”  → Farbwert der Füllung, Form, Radius
* “#ff00aa,rect,8,8”  → Farbwert der Füllung, Form, Breite, Höhe
* “#ff00aa,polygon,3” → Farbwert der Füllung, Form, Breite der Außenlinie

Alternativ kann eine Funktion angegeben werden, die diesen String auf Basis
des jeweiligen Features zurückgibt

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | String, eval:(anyValidFunction) returning valid style-string|
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | `#ff00aa,circle,8` <br>oder<br> `eval:(function(feature){if(feature.get('value') < 0.005) {return '#0000ee,circle,45';} else {return '#ff00aa,circle,10';}})` |

**source_xyz**

'xyz' ist ein Platzhalter für eine opt_option einer ol.source.Source:

Beispiel: source_attributions, source_crossOrigin, source_hidpi, ...

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Siehe http://openlayers.org/en/latest/apidoc/ol.source.html  |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | Siehe http://openlayers.org/en/latest/apidoc/ol.source.html  |

**param_xyz**

'xyz' ist ein Platzhalter für die params einer ol.source.Source:

Auszug aus der OpenLayers Dokumentation für ImageWMS:
```
WMS request parameters. At least a LAYERS param is required. STYLES is '' by default.
VERSION is 1.3.0 by default. WIDTH, HEIGHT, BBOX and CRS (SRS for WMS version < 1.3.0) will be set dynamically. Required.
```

Beispiel: param_width, param_height, param_version, ...

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Siehe http://openlayers.org/en/latest/apidoc/ol.source.ImageWMS.html  |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | Siehe http://openlayers.org/en/latest/apidoc/ol.source.ImageWMS.html  |

**encodeFilterInViewparams**

Flag zum de-/aktivieren der Übernahme des Filters in die Viewparams.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | false |
| Beispiel             | false |

**featureShortDspField**

z.B. für die Serie hinzufügen combo

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   |  |
| Obligatorisch        | &#10799; |
| Default-Wert         | name |
| Beispiel             | name |

**featureIdentifyField**

z.B. für die Serie hinzufügen combo

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   |  |
| Obligatorisch        | &#10799; |
| Default-Wert         | id |
| Beispiel             | id |

**featureIdentifyFieldDataType**

z.B. für die Serie hinzufügen combo

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | string, number |
| Obligatorisch        | &#10799; |
| Default-Wert         | string |
| Beispiel             | string |

**showCartoWindow**

Flag zum de-/aktivieren des CartoWindow-Modus.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | false |
| Beispiel             | true |

**cartoXOffset**

Konfiguriert den X-Offset für CartoWindows.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Zahl |
| Obligatorisch        | &#10799; |
| Default-Wert         | 15 |
| Beispiel             | 20 |

**cartoYOffset**

Konfiguriert den Y-Offset für CartoWindows.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Zahl |
| Obligatorisch        | &#10799; |
| Default-Wert         | 0 |
| Beispiel             | 20 |

**tableContentProperty**

Wenn gesetzt, wird im CartoWindow-Modus ein Table-Tab angezeigt. Die
Tabelle kann dabei aus GeoJSON, JSON (arrays in array) und CSV erzeugt
werden, es kann auch direkt rohes HTML angezeigt werden.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | string siehe Beschreibung |
| Obligatorisch        | &#10799; |
| Default-Wert         | leer |
| Beispiel             | [[1,2,3],[4,5,6]] |

**tableContentURL**

Wie **tableContentProperty**, jedoch wird der Inhalt aus der
angegebenen URL geladen. Es können Ersetzungen verwendet werden
(doppelte eckige Klammern), das Kontextobjekt ist das angeclickte
Feature. Die Ersetzungen finden in der URL statt.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | URL |
| Obligatorisch        | &#10799; |
| Default-Wert         | leer |
| Beispiel             | http://bfs.de/test.csv |

**htmlContentProperty**

Wenn gesetzt, wird im CartoWindow-Modus ein HTML-Tab angezeigt.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | HTML-string |
| Obligatorisch        | &#10799; |
| Default-Wert         | leer |
| Beispiel             | <p>Beschreibung</p> |

**htmlContentURL**

Wie **htmlContentProperty**, jedoch wird der Inhalt aus der
angegebenen URL geladen. Es können Ersetzungen verwendet werden
(doppelte eckige Klammern), das Kontextobjekt ist das angeclickte
Feature. Die Ersetzungen finden in der URL statt.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | URL |
| Obligatorisch        | &#10799; |
| Default-Wert         | leer |
| Beispiel             | http://bfs.de/test.html |

**cartoWindowLineStyle**

Der Style der Verbinungslinien zwischen CartoWindow und entsprechendem Feature.
Kommasepariert werden Farbe und Stärke der Linie angegeben.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Kommaseparierter String |
| Obligatorisch        | &#10799; |
| Default-Wert         | '#294d71,4' |
| Beispiel             | '#FF0000,2' |


## Generische Chart Properties {#genericcharts} (bfs:timeSeriesChartProperty)

**backgroundColor**

Die Hintergrundfarbe der chart area.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Hex-Code |
| Obligatorisch        | &#10799; |
| Default-Wert         | #EEE |
| Beispiel             | #ABABAB |

**chartMargin**

Komma separierte Liste von chart margins: (top, right, bottom, left)

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Siehe Beschreibung |
| Obligatorisch        | &#10799; |
| Default-Wert         | 10,200,20,40 |
| Beispiel             | 50,100,200,100 |

**colorSequence**

Komma separierte Liste von Hex-Codes, die Farben der Chart-Series definieren.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Siehe Beschreibung |
| Obligatorisch        | &#10799; |
| Default-Wert         | Zufallsfarbe |
| Beispiel             | #ff0000,#00ff00 (fehlende: Zufallsfarbe) |

**dataFeatureType**

FeatureType der die Daten enthält.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | FeatureType Name (String) |
| Obligatorisch        | &#10003; |
| Default-Wert         |  |
| Beispiel             | BFS:result |

**dspUnit** // TODO prüfen ob dies zukünftig entfällt

Einheit die die Daten beschreibt.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | String |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | µSv/h |

**duration**

Ein ISO_8601 duration string der den Zeitraum der darzustellenden Daten beschreibt.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | ISO_8601 Duration-String |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | P4WT |

**end_timestamp**

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10799; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00  |

**end_timestamp_format**

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | Wenn end_timestamp angegeben ist. |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s  |

**featureStyle**

Der regelbasierte Stil für die Messwerte.
Der Wert ist ein Array von Objekten, die die Regel
und den Stil definieren.

| Typ | gco:CharacterString |
|---------------------:|:----|
| Erlaubte Wertemenge  | Array von Objekten |
| Obligatorisch        | &#10799; |
| Default-Wert         | leer |

Beispiel:
```
[{
      "attribute": "validated",
      "operator": "eq",
      "value": true,
      "style": {
          "type": "circle",
          "radius": "5"
      }`
  }, {`
      "attribute": "value",
      "operator": "eq",
      "value": 0.08,
      "style": {
          "type": "circle",
          "radius": "10"
      }
  }, {
      "attribute": "value",
      "operator": "between",
      "value": "0.09,0.01",
      "style": {
          "type": "star",
          "sides": 5,
          "radius": 10
      }
  }, {
      "attribute": "value",
      "operator": "gt",
      "value": 0.02,
      "style": {
          "type": "rect",
          "width": 15,
          "height": 20
      }
  }]
```

* attribute -> Das Attribut das ausgewertet werden soll

* operator -> Der Operator für die Regel. Kann einen der folgenden Werte annehmen:
'eq' (equals),
'ne' (not equals),
'gt' (greater than),
'lt' (lower than),
'lte' (lower than equals),
'gte' (greater than equals),
'between' (Gültigkeitsbereich).
Wenn 'between' verwendet werden soll, muss der 'value' als kommasperarierter String definiert werden mit genau 2 Werten: "1.06,5"

* value -> Der Wert für die Bedingung

* style -> Das Style Objekt das angewendet werden soll, wenn die Regel zutrifft

  * type -> Form für die Darstellung. Derzeit unterstützt sind "circle", "rect" und "star"

  * type "rect" -> hat als properties "width" und "height"

  * type "circle" -> hat als properties "radius"

  * type "star" -> hat als properties "sides" (Anzahl der Sternseiten) und "radius"

**gridStrokeColor**

  Die Strichfarbe des Hintergrundgrids.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Hex-Code |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | #d3d3d3 |
  | Beispiel             | #d3d3d3  |

**gridStrokeOpacity**

  Die Strichopazität des Hintergrundgrids.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Zahl (0 - 1)  |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | 0.7 |
  | Beispiel             | 1  |

**gridStrokeWidth**

  Die Strichbreite des Hintergrundgrids.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Zahl (> 0)  |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | 1 |
  | Beispiel             | 2  |

**labelColor**

  Die Farbe des Achsen-Labels.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Hex-Code |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | #000  |
  | Beispiel             | #000  |

**labelPadding**

  Der Abstand zwischen Achse und Label.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Zahl (> 0)  |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | 25 |
  | Beispiel             | 70 |

**labelSize**

  Die größe der Achsen-Labels.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Zahl (> 0)  |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | 12 |
  | Beispiel             | 8 |

**legendEntryMaxLength**

  Die maximale Breite von Legendentexten in Zeichen.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Zahl (> 0)  |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | 20 |
  | Beispiel             | 20 |

**seriesTitleTpl**

Template-String der als Title für das Chart angezeigt wird. Werte in doppelten
eckigen Klammern werden durch Attribute des Features ersetzt.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Template-String |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | Standort: [[locality_name]]|

**maxTitleLength**

  Die maximale Breite vom Legendentitel in Pixeln.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Zahl (> 0)  |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | 100 |
  | Beispiel             | 20 |

**showGrid**

  Soll ein Hintergrundgrid gezeigt werden?

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | true, false  |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | false |
  | Beispiel             | true  |

**strokeOpacity**

  Die Strichopazität des ChartSeries.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Zahl (0 - 1)  |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | 1 |
  | Beispiel             | 1  |

**strokeWidth**

  Die Strichbreite der ChartSeries.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Zahl (> 0)  |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | 1 |
  | Beispiel             | 2  |

**tickPadding**

  Der Abstand zwischen Achsen-Ticks und dem Achsen-Label.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Zahl (> 0)  |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | 3 |
  | Beispiel             | 8 |

**tickSize**

  Die Größe der Achsen-Ticks.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Zahl (> 0)  |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | 6 |
  | Beispiel             | 10  |

**title**

    Der Titel des Charts.

    | Typ | gco:CharacterString  |
    |---------------------:|:----|
    | Erlaubt Wertemenge   | String |
    | Obligatorisch        | &#10799; |
    | Default-Wert         |   |
    | Beispiel             | Toller Chart  |

**titleColor**

  Die Farbe des Chart-Titels.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Hex-Code |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | #000  |
  | Beispiel             | #000aaa  |

**titlePadding**

  Der Abstand zwischen Chart und Chart-Titel.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Zahl (> 0)  |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | 18 |
  | Beispiel             | 18 |

**titleSize**

  Der Größe des Titles.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Zahl (> 0)  |
  | Obligatorisch        | &#10799; |
  | Default-Wert         | 20 |
  | Beispiel             | 10 |

**tooltipTpl**

Template-String der beim Hovern von Chart-Punkten als Tooltip angezeigt wird.
Werte in doppelten eckigen Klammern werden durch Attribute des Features ersetzt.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Template-String |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | Messwert (µSv/h):[[value]]|

**xAxisFormat**

Das Templateformat für das X-Achsen-Label. Siehe: https://github.com/d3/d3-format

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | d3-format-String |
| Obligatorisch        | &#10799; |
| Default-Wert         | ,.0f |
| Beispiel             | ,.1f |

**xAxisLabel**

Das Label, dass an der X-Achse angezeigt werden soll.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   |  |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             |  |

**xAxisScale**

Der Scale-Typ, der für die X-Achse verwendet werden soll. Siehe
https://github.com/d3/d3/blob/master/API.md#scales-d3-scale

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | linear, pow, sqrt, log, ident, time, ordinal  |
| Obligatorisch        | &#10799; |
| Default-Wert         | time |
| Beispiel             | linear |

**showYAxis**

Steuert (nur für attached series!), ob eine y-Achse gezeichnet werden soll oder nicht.

| Typ | gco:Boolean  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true/false |
| Obligatorisch        | &#10799; |
| Default-Wert         | false |
| Beispiel             | false |

**yAxisMin/Max**

Min/Max-Wert der Y-Achse. Wenn angegeben, müssen min und max beide konfiguriert werden.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Zahl oder undefined |
| Obligatorisch        | &#10799; |
| Default-Wert         | berechnet aus Daten wenn undefined|
| Beispiel             | 0.1 |

**yAxisFormat**

Das Templateformat für das Y-Achsen-Label. Siehe: https://github.com/d3/d3-format

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | d3-format-String |
| Obligatorisch        | &#10799; |
| Default-Wert         | ,.0f |
| Beispiel             | ,.1f |

**yAxisLabel**

Das Label, dass an der Y-Achse angezeigt werden soll.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   |  |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             |  |

**yAxisScale**

Der Scale-Typ, der für die Y-Achse verwendet werden soll. Siehe
https://github.com/d3/d3/blob/master/API.md#scales-d3-scale

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | linear, pow, sqrt, log, ident, time, ordinal  |
| Obligatorisch        | &#10799; |
| Default-Wert         | linear |
| Beispiel             | log |

**xAxisMin/Max**

Min/Max-Wert der X-Achse. Wenn angegeben, müssen min und max beide konfiguriert werden.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Zahl oder undefined |
| Obligatorisch        | &#10799; |
| Default-Wert         | berechnet aus Daten wenn undefined|
| Beispiel             | 0.1 |

**xAxisAttribute**

Das Attribut, dessen Wert auf der X-Achse abgezeichnet wird.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Attributname der Features |
| Obligatorisch        | &#10003; |
| Default-Wert         |  |
| Beispiel             | end_measure |

**yAxisAttribute**

Das Attribut, dessen Wert auf der Y-Achse abgezeichnet wird.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Attributname der Features |
| Obligatorisch        | &#10003; |
| Default-Wert         |  |
| Beispiel             | result_value |

**rotateXAxisLabel**

Sollen die Label an der X-Achse um -55 Grad rotiert werden?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false  |
| Obligatorisch        | &#10799; |
| Default-Wert         | false |
| Beispiel             | true |

**chartWidth**

Breite des Charts in Pixel

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | ganze Zahl  |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | 500 |

**chartHeight**

Höhe des Charts in Pixel

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubte Wertemenge  | ganze Zahl  |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | 250 |

**chartMinWidth**

Minimale Breite des Charts in Pixel

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubte Wertemenge  | ganze Zahl  |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | 500 |

**chartMinHeight**

Minimale Höhe des Charts in Pixel

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubte Wertemenge  | ganze Zahl  |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | 500 |

## Timeseries Chart Properties {#timeseries} (bfs:timeSeriesChartProperty)

**allowZoom**

Soll der Zoom im Chart erlaubt sein?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false  |
| Obligatorisch        | &#10799; |
| Default-Wert         | false |
| Beispiel             | true |

**allowFilterForm**

Soll das Filterformular für das Chart angezeigt werden?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false  |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**allowAddSeries**

Soll das Hinzufügen einer Series ermöglicht werden?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false  |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**curveType**

Der Interpolationstyp der Kurve. „linear“, „cubicBasisSpline“, „curveMonotoneX“,
„naturalCubicSpline“, „curveStep“, „curveStepAfter“ oder „curveStepBefore“,
siehe https://github.com/d3/d3/blob/master/API.md#curves

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | siehe Beschreibung |
| Obligatorisch        | &#10799; |
| Default-Wert         | linear |
| Beispiel             | „cubicBasisSpline“ |

**shapeType**

Das Darstellungsformat der Kurve.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | line, area |
| Obligatorisch        | &#10799; |
| Default-Wert         | line |
| Beispiel             | area |

**showTimeseriesGrid**

Falls true, wird ein Tab mit den Messdaten in einem Ext.grid angezeigt.

| Typ | gco:CharacterString |
|----------------------:----|
| Erlaubte Wertemenge  | false, true |
| Obligatorisch        | &#10799; |
| Default-Wert         | false |
| Beispiel             | true |

**thresholds**

Kann ein Array von Objekten beinhalten, welches Schwellenlinien im Chart konfiguriert. Ein Threshold-Objekt muss mindestens die Werte "value", "tooltip", "label", "stroke" und "lineWidth" enthalten. Der "value" konfiguriert, bei welchem Wert (Y-Achse) die Linie gezeichnet wird. "label" ist der Text des Legendeneintrags, "tooltip" der Tooltip beim hover über der Legende. "stroke" konfiguriert den Farbwert, "lineWidth" die Linienstärke. Optional kann ein "dasharray" angegeben werden, mit dem eine gestrichelte Linie konfiguriert wird. Die kommaseparierte Liste gibt abwechselnd an, wie viele Pixel Linie bzw. keine Linie gezeichnet werden soll.

| Typ | gco:CharacterString |
|----------------------:----|
| Erlaubte Wertemenge  | Array von Objekten |
| Obligatorisch        | &#10799; |
| Default-Wert         | leer |
| Beispiel             | [{"value": 10, "tooltip": "Tooltip 1", "stroke": "#ff0000", "lineWidth": 2, "dasharray": "5, 5", "label": "Grenze 1"}, {"value": 15, "stroke": "#00ff00", "lineWidth": 1, "label": "Grenze 2", "tooltip": "Tooltip 2"}] |

**attachedSeries**

Kann ein Array von Objekten beinhalten, welches zusätzliche Zeitreihen konfiguriert. Das Objekt kann die gleichen Konfigurationsoptionen beinhalten, wie ein normales Zeitreihen-Diagramm. Zusätzlich kann die Breite der Y-Achse mittels "axisWidth" konfiguriert werden.

| Typ | gco:CharacterString |
|----------------------:----|
| Erlaubte Wertemenge  | Array von Objekten |
| Obligatorisch        | &#10799; |
| Default-Wert         | [] |
| Beispiel             | [{"yAxisAttribute": "value_oberergw", "axisWidth": 60, "labelPadding": 40, "dspUnit": "Oberer Grenzwert"}, {"yAxisAttribute": "value_unterergw", "dspUnit": "Unterer Grenzwert", "color": "#00ff00"}] |


## Bar Chart Properties {#barchart} (bfs:barChartProperty)

**barWidth**

Initiale Breite der Säulen in Pixel.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Integer |
| Obligatorisch        | &#10799; |
| Default-Wert         | 10 |
| Beispiel             | 20 |

**colorMapping**

Konfiguration für Farbzurodnungen im JSON Format. Kann ein JSON Objekt oder eine
URL sein, die ein solches zurückliefert. URLs müssen mit dem prefix url: versehen werden.
Beispiel: url:http://localhost/colors.json

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | String  |
| Obligatorisch        | &#10799; |
| Default-Wert         | leer |
| Beispiel Rückgabe           |
```
{
  "Cs 137": {
    "color": "#4040ff"
  },
  "I 131": {
    "color": "#0006FF"
  },
  "K 40": {
    "color": "#0006FF"
  }
}
```


**labelFunc**  // TODO Fällt nach Änderung der Datenstruktur ggf weg.

JavaScript-Funktion, welche zum Generieren von Labels verwendet wird ()

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | eval:(anyValidFunction) returning string compatibele Value|
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | eval:(function(){return function(val){return val < 0.03 ? 'NN' : val + '';}}()) |

**detectionLimitAttribute**

Das Attribut, dessen Wert die Nachweisgrenze enthält.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Attributname der Features |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | nachweisgrenze |

**uncertaintyAttribute**

Das Attribut, dessen Wert die Ungenauigkeit enthält.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Attributname der Features |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | uncertainty |

**groupAttribute**

Das Attribut, dessen Werte in der Ansicht in Gruppen aufgeteilt werden sollen.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Attributname der Features |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | end_measure |

**groupLabelAttribute**

Das Attribut, das bei Gruppierung angezeigt werden soll.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Attributname der Features |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | end_measure |

**drawBarCondition**

JavaScript-Funktion, die entscheidet, ob ein Punkt in der Zeitreihe gezeichnet wird oder nicht

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | eval:(anyValidFunction) returning boolean|
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | eval:(function(){return function(obj){ if (obj.detection_limit==='<') { return false; } else { return true; } } }()) |

**showBarchartGrid**

Falls true, wird ein Tab mit den Messdaten in einem Ext.grid angezeigt.

| Typ | gco:CharacterString |
|----------------------:----|
| Erlaubte Wertemenge  | false, true |
| Obligatorisch        | &#10799; |
| Default-Wert         | false |
| Beispiel             | true |
