# Routing Import {#routingimport}

Das Flottenrouting stellt die Möglichkeit bereit, Ziele und Fahrzeuge jeweils über eine JSON-Datei zu importieren.

## Ziele importieren {#importjobs}

Die hochzuladende JSON-Datei muss für den Import von Zielen der Struktur des unten stehenden Beispiels entsprechen.
Hierbei entspricht die Struktur eines einzelnen Ziels der [VROOM Spezifikation für Jobs](https://github.com/VROOM-Project/vroom/blob/master/docs/API.md#jobs).
Dementsprechend muss für jedes Ziel mindestens das Attribut `location` angegeben werden.

Wichtig: Das Attribut `id` wird beim Import ignoriert und kann somit ausgelassen werden.

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

## Fahrzeuge importieren {#importvehicles}

Die hochzuladende JSON-Datei muss für den Import von Fahrzeugen der Struktur des unten stehenden Beispiels entsprechen.
Hierbei entspricht die Struktur eines einzelnen Fahrzeugs der [VROOM Spezifikation für Fahrzeuge](https://github.com/VROOM-Project/vroom/blob/master/docs/API.md#vehicles).
Dementsprechend muss für jedes Fahrzeug mindestens das Attribut `start` oder `end` angegeben werden.

Wichtig: Das Attribut `id` wird beim Import ignoriert und kann somit ausgelassen werden.

Beispiel (3 Fahrzeuge - 1. Fahrzeug verpflichtendes Attribut `start`; 2. Fahrzeug verpflichtendes Attribut `end`; 3. Fahrzeug alle unterstützen Attribute):

```json
[
    {
        "start": [
            7.097194486145247,
            50.703541
        ]
    },
    {
        "end": [
            6.959974,
            50.938361
        ]
    },
    {
        "start": [
            7.097194486145247,
            50.703541
        ],
        "end": [
            6.959974,
            50.938361
        ],
        "description": "my description",
        "breaks": [
            {
                "time_windows": [
                    [
                        1619514900,
                        1619601300
                    ]
                ],
                "description": "my break",
                "service": 45000
            }
        ],
        "time_window": [
            1619478900,
            1619656200
        ]
    }
]

```
