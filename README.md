IMIS3 GIS-Client
===========
Dies ist eine Kopie des ExtJS basierten Klienten der vom Bundesamt für Strahlenschutz zur kartographischen webbasierten Visualisierung von Umweltdaten entwickelt und eingesetzt wird.

Um den vollen Umfang der Software zu nutzen ist es erforderlich den Klienten mit anderen Produkten des BfS gemeinsam einzusetzen.

Weitere Informationen finden sich auf der Projektwebseite unter
der Adresse: https://github.com/OpenBfS/gis-client

Die Software entsteht im Rahmen der Neuentwicklung des IMIS (in v3).

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
da der IMIS3 GIS-Client von einigen Submodulen abhängt ist es empfohlen diese mit zu klonen
```
git clone --recurse-submodules https://github.com/OpenBfS/gis-client.git
```

Dokumentation
-------------
Die Dokumentation wird mit dem Tool JSDuck erzeugt.
Im src-Ordner lässt sich nach der Installation von JSDuck dann mit dem
Befehl `jsduck` die Dokumentation für den GIS-Klienten erzeugen.
Die Dokumentation findet sich nach der Generierung im Order `docs`.

JSDuck ist unter der Adresse https://github.com/senchalabs/jsduck
zu finden und muss installiert werden.

Die Dokumentation kann dann mit folgendem Befehl gebaut werden:

```
npm run jsduck
```

Einstellungen bezüglich der Generierung der Dokumentation sind in der Datei
`jsduck-config.json` hinterlegt.

Entwicklung
-----------
Für die Entwicklung ist es notwendig in dem Wurzelordner die ExtJS-Bibliothek
in der Version >=6.2.0 unter dem Namen "ext" (als Symlink per ln -s ... oder
als Kopie per cp -r ...) zur Verfügung zu stellen.

```
git submodule update --init --recursive
cd src/
ln -s <Pfad zu ExtJS>/ext-6.2.0 ext
sencha app install --framework=ext
# d3-utils bauen
cd resources/lib/d3-util
npm install
npm run build:dist
```
Danach kann mit `docker-compose up` hochgefahren werden und die Anwendung über
http://localhost/index-dev.html aufgerufen werden.

Unter Umständen wird (für GeoStyler) noch ein einmaliger dev build benötigt.
Kann z.B. via 
```
docker run -v /home/myname/workspace/bfs_koala/src:/src -it terrestris/sencha-cmd:version-7.2.0.56-3 bash -c "cd /src && /opt/Sencha/sencha app build development
```

Falls es Probleme beim Build gibt, zur Sicherheit den `build` Ordner löschen

Build
-----
Die Anwendung wird mit Hilfe des von Sencha bereitgestellten Tools 'Sencha Cmd'
kompiliert und minifiziert.
FIXME: put Install in separate `INSTALL.markdown`.

Installation
------------
FIXME: put Install in separate `INSTALL.markdown`.
Für Informationen zur Installation schauen Sie in die `INSTALL.markdown` Datei.
