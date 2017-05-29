# LayerInformation {#layerinformation}

## Layer Type {#layertype}
### WMS {#layertype-wms}

*URL (bfs:URL)*

* **Host** (bfs:host)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | http://bfs-docker.intranet.terrestris.de  |

* **Path** (bfs:path)

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

* **Host** (bfs:host)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | http://bfs-docker.intranet.terrestris.de  |

* **Path** (bfs:path)

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

* **Host** (bfs:host)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | http://bfs-docker.intranet.terrestris.de  |

* **Path** (bfs:path)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | /geoserver/imis/ows?  |

## Layer Filters {#filters}

### Point In Time {#filters-pointintime}

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

* **Time Format** (bfs:TimeFormat)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s |

* **Time** (bfs:TimeInstant)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00 |

*Max. Date (bfs:maxDate)*

* **Time Format** (bfs:TimeFormat)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s |

* **Time** (bfs:TimeInstant)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00 |

*Default Value (bfs:defaultValue)*

* **Time Format** (bfs:TimeFormat)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s |

* **Time** (bfs:TimeInstant)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00 |

### Timerange {#filters-timerange}

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

* **Time Format** (bfs:TimeFormat)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s  |

* **Time** (bfs:TimeInstant)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00  |

*Max. Date (bfs:maxDate)*

* **Time Format** (bfs:TimeFormat)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s  |

* **Time** (bfs:TimeInstant)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00  |

*Default Start Date (bfs:defaultStartValue)*

* **Time Format** (bfs:TimeFormat)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s  |

* **Time** (bfs:TimeInstant)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00  |

*Default End Date (bfs:defaultEndValue)*

* **Time Format** (bfs:TimeFormat)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | Y-m-d H:i:s  |

* **Time** (bfs:TimeInstant)

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   |   |
  | Obligatorisch        | &#10003; |
  | Default-Wert         |  |
  | Beispiel             | 2016-10-17 00:00:00  |

## OpenLayers Properties {#openlayers} (bfs:olProperty)

**allowHover**

Soll HoverInfo erlaubt werden.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**allowFeatureInfo** // TODO Brauchen wir das noch?

Soll FeatureInfo erlaubt werden.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**allowDownload**

Soll ein Download erlaubt werden.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**allowRemoval**

Soll das Entfernen aus dem Tree erlaubt werden.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**allowShortInfo**

Soll die Anzeige einer Kurzinfo erlaubt werden.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**allowPrint**

Soll das Drucken erlaubt werden.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**allowOpacityChange**

Soll die Opazität zur Laufzeit verändert werden dürfen.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | true, false |
| Obligatorisch        | &#10799; |
| Default-Wert         | true |
| Beispiel             | true |

**hoverTpl**

Template-String der beim Hovern über Features angezeigt wird. Werte in doppelten
eckigen Klammern werden durch Attribute des Features ersetzt.  

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Template-String |
| Obligatorisch        | Wenn allowHover = true |
| Default-Wert         |  |
| Beispiel             | [[locality_name]]<br>[[end_measure]] <br>Messwert (µSv/h):[[value]]<br>|

**hoverstyle**

Es kann ein String mit drei Komma separierten Werten angegebene werden: z.B.:

* “#ff00aa,circle,8”  → Farbwert der Füllung, Form, Radius
* “#ff00aa,rect,8,8”  → Farbwert der Füllung, Form, Breite, Höhe
* “#ff00aa,polygon,3” → Farbwert der Füllung, Form, Breite der Außenlinie

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | siehe Beschreibung |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | #ff00aa,circle,8 |

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

**routeId**

Id für den RoutingLegendTree. //TODO wird das noch benötigt?

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | String ID |
| Obligatorisch        | &#10799; |
| Default-Wert         | inspireId |
| Beispiel             | 83cb1604-3d8c-490b-b807-5e7cb17f3b22 |

**layer_xyz**

'xyz' ist ein Platzhalter für eine opt_option eines ol.layer.Layer:

Beispiel: layer_opacity, layer_visible, layer_extent, layer_zIndex, ...

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Siehe http://openlayers.org/en/latest/apidoc/ol.layer.html  |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | Siehe http://openlayers.org/en/latest/apidoc/ol.layer.html  |

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

  Der Abstand zwischen Aches und Label.

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

  Die maximale Anzahl an Legendeneinträgen.

  | Typ | gco:CharacterString  |
  |---------------------:|:----|
  | Erlaubt Wertemenge   | Zahl (> 0)  |
  | Obligatorisch        | &#10799; |
  | Default-Wert         |  |
  | Beispiel             |  |

**seriesTitleTpl**

Template-String der als Title für das Chart angezeigt wird. Werte in doppelten
eckigen Klammern werden durch Attribute des Features ersetzt.

| Typ | gco:CharacterString  |
|---------------------:|:----|
| Erlaubt Wertemenge   | Template-String |
| Obligatorisch        | &#10799; |
| Default-Wert         |  |
| Beispiel             | Standort: [[locality_name]]|

**showGrid**

  Soll ein Hintergrundgrid gezeigt werden.

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

## Timeseries Chart Properties {#timeseries} (bfs:timeSeriesChartProperty)

## Bar Chart Properties {#barchart} (bfs:barChartProperty)
