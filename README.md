![Logo](admin/vesync.png)

# ioBroker.vesync

[![NPM version](https://img.shields.io/npm/v/iobroker.vesync.svg)](https://www.npmjs.com/package/iobroker.vesync)
[![Downloads](https://img.shields.io/npm/dm/iobroker.vesync.svg)](https://www.npmjs.com/package/iobroker.vesync)
![Number of Installations](https://iobroker.live/badges/vesync-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/vesync-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.vesync.png?downloads=true)](https://nodei.co/npm/iobroker.vesync/)

**Tests:** ![Test and Release](https://github.com/TA2k/ioBroker.vesync/workflows/Test%20and%20Release/badge.svg)

## vesync adapter for ioBroker

Adapter for VeSync

# Loginablauf

Die App Mail und Passwort eingeben.

# Steuerung

Geräte können via vesync.0.id.remote gesteuert werden

## VIS-Oberfläche (1024×535)

Eigenständige Touch-Oberfläche für ioBroker VIS / Fire-Tablet (nicht Teil von GartenSmart):

1. Web-Adapter muss aktiv sein
2. Nach Adapter-Update: `iobroker upload vesync`
3. URL (Instanz 0): `http://<ioBroker-IP>:8082/vesync/vis/index.html`
4. In ioBroker VIS als **iframe**-Widget einbinden (1024×535)

**Wichtig:** Nach Änderungen an `www/` unbedingt `iobroker upload vesync` ausführen, sonst sind die Dateien nicht im Web-Adapter verfügbar.

Anzeige: Geräteliste, Live-Status, steuerbare Remotes (Ein/Aus, Modi, Stufen). Komplexe JSON-Kochbefehle bleiben über die Objekte/Scripts nutzbar.

startCook Beispieles Fritten:

```
{
            "accountId": "000000",
            "cookTempDECP": 0,
            "hasPreheat": 1,
            "hasWarm": false,
            "imageUrl": "",
            "mode": "Fries",
            "readyStart": true,
            "recipeId": 18,
            "recipeName": "Fritten",
            "recipeType": 3,
            "startAct": {
                "appointingTime": 0,
                "cookSetTime": 240,
                "cookTemp": 75,
                "cookTempDECP": 0,
                "imageUrl": "",
                "level": 0,
                "preheatTemp": 75,
                "shakeTime": 120,
                "targetTemp": 0
            },
            "tempUnit": "c"
        }
```

AirFry

```
{
            "accountId": "000000",
            "cookTempDECP": 0,
            "hasPreheat": 0,
            "hasWarm": false,
            "imageUrl": "",
            "mode": "AirFry",
            "readyStart": true,
            "recipeId": 14,
            "recipeName": "Air Fry",
            "recipeType": 3,
            "startAct": {
                "appointingTime": 0,
                "cookSetTime": 600,
                "cookTemp": 180,
                "cookTempDECP": 0,
                "imageUrl": "",
                "level": 0,
                "preheatTemp": 0,
                "shakeTime": 0,
                "targetTemp": 0
            },

```

cookMode:

```
{
            "accountId": "8604100",
            "appointmentTs": 0,
            "cookSetTemp": 175,
            "cookSetTime": 15,
            "cookStatus": "cooking",
            "customRecipe": "Manuell",
            "mode": "custom",
            "readyStart": true,
            "recipeId": 1,
            "recipeType": 3,
            "tempUnit": "celsius"
        }
```

Stop:

```
{
            "cookStatus": "end"
        }
```

## Diskussion und Fragen

<https://forum.iobroker.net/topic/59466/test-adapter-vesync>

## Changelog
### 1.0.7 (2026-08-22)

- Fix VIS URL: use `/vesync/vis/index.html` on web adapter port 8082

### 1.0.6 (2026-08-22)

- Add standalone VIS panel (1024×535) under `www/vis/` for device status and controls

### 1.0.5 (2026-08-10)

- Only create remote objects relevant for each device type
- Auto-detect new devices on refresh and update interval
- Remove unused remotes from other device categories

### 1.0.4 (2026-05-18)

- Add Cosori Oven support (CS130, CS125, CS100, AG500) with getOvenStatusV2, startStepCook, skipStep, setTempUnit
- Add Cosori Dual Blaze TwinFry multi-zone support (getAirfryerMultiStatus, startMultiCook, quitSyncFinish)
- Add Purifier pet mode (setPurifierMode: pet, turbo, pollen)

### 1.0.3 (2026-01-12)

- fix login
- add new devices

### 0.0.10 (2026-01-11)

- fix login

### 0.0.9 (2024-12-21)

- fix login

### 0.0.8 (2024-10-26)

- fix login

### 0.0.3

- (TA2k) initial release

## License

MIT License

Copyright (c) 2022-2026 TA2k <tombox2020@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

```
