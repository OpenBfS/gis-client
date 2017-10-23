IMIS3 GIS-Client
===========
Dies ist eine Kopie des ExtJS basierten Klienten der vom Bundesamt für Strahlenschutz zur kartographischen webbasierten Visualisierung von Umweltdaten entwickelt und eingesetzt wird.

Um den vollen Umfang der Software zu nutzen ist es erforderlich den Kliengten mit anderen Produkten des BfS gemeinsam einzustetzen.

Weitere Informationen finden sich auf der Projektwebseite unter
der Adresse: https://github.com/OpenBfS/gis-client

Die Software entseht im Rahmen der Neuentwicklung des IMIS (in v3).

Kontakt
-------
Bundesamt für Strahlenschutz
SW2 Notfallschutz, Zentralstelle des Bundes (ZdB)
Willy-Brandt-Strasse 5
38226 Salzgitter
info@bfs.de

Lizenz
------
Die Software ist unter der GNU GPL v>=3 Lizenz verfügbar. Details siehe Datei `COPYING`.

Quelltext
---------
Die Quelldateien lassen sich wie folgt auschecken:
```
git clone https://github.com/OpenBfS/gis-client.git
```

Dokumentation
-------------
Die Dokumentation wird mit dem Tool JSDuck erzeugt.
Im src-Ordner lässt sich nach der Installation von JSDuck dann mit dem
Befehl `jsduck` die Dokumentation für den GIS-Klienten erzeugen.
Die Dokumentation findet sich nach der Generierung im Order `docs`.

JSDuck ist unter der Adresse https://github.com/senchalabs/jsduck
zu finden und muss installiert werden.

Die Dokumentation kann dann mit folgendem befehl gebaut werden:

```
npm run jsduck
```

Einstellungen bezüglich der Generierung der Dokumentation sind in der Datei
`jsduck-config.json` hinterlegt.

Entwicklung
-----------
Für die Entwicklung ist es notwendig in dem Wurzelordner die ExtJS-Bibliothek
in der Version >=6.2.0 unter dem Namen "ext" zur Verfügung zu stellen.

Build
-----
Die Anwendung wird mit Hilfe des von Sencha bereitgestellten Tools 'Sencha Cmd'
kompiliert und minifiziert.
FIXME: put Install in separate `INSTALL.markdown`.

Installation
------------
FIXME: put Install in separate `INSTALL.markdown`.
Für Informationen zur Installation schauen Sie in die `INSTALL.markdown` Datei.
