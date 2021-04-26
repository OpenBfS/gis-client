# Routing Import {#routingimport}

Das Flottenrouting stellt die Möglichkeit bereit, Ziele über eine JSON-Datei zu importieren.

## Ziele importieren {#importjobs}

Die hochzuladende JSON-Datei muss für den Import von Zielen der Struktur des unten stehenden Beispiels entsprechen.
Hierbei entspricht die Struktur eines einzelnen Ziels der [VROOM Spezifikation für Jobs](https://github.com/VROOM-Project/vroom/blob/master/docs/API.md#jobs).
Dementsprechend muss für jedes Ziel mindestens das Attribut `location` angegeben werden.

Beispiel (2 Ziele - 1. Ziel verpflichtende Attribute; 2. Ziel alle unterstützten Attribute):

```json
[
    {
        "location": [
            8.162841796874998,
            51.8086147519852
        ]
    },
    {
        "description": "Ziel 2",
        "id": 2,
        "service": 32400,
        "priority": 1,
        "time_windows": [
            [
                1616661941,
                1616661941
            ]
        ],
        "location": [
            7.921142578124998,
            50.750359311369635
        ]
    }
]
```
