# Fix OctoPrint connection initialization by using SockJS client instead of raw websocket

## Summary

This fixes an `initializing` hang when connecting OctoDash to current OctoPrint/OctoPi installs.

The root issue was that OctoDash was opening a raw websocket directly against `sockjs/websocket`, while OctoPrint's own frontend uses the SockJS client against `.../sockjs` and then sends socket auth after connection open. On a live OctoPrint `1.11.7` / OctoPi `1.1.0` system, the raw websocket path was consistently returning `403`, which left OctoDash stuck during startup.

This patch switches OctoDash to the same connection model OctoPrint itself uses.

## Changes

- add `sockjs-client`
- replace RxJS raw websocket usage in `socket.octoprint.service.ts`
- connect to `.../sockjs` instead of `.../sockjs/websocket`
- send `{ auth: "<user>:<session>" }` after socket open
- keep existing passive login and reauth behavior

## Reproduction

On a Raspberry Pi running:

- OctoPi `1.1.0`
- OctoPrint `1.11.7`
- Python `3.11.2`

OctoDash would:

- validate config successfully
- save config successfully
- stall on `initializing`

OctoPrint logs showed:

```text
403 GET /sockjs/websocket (127.0.0.1)
```

An intermediate test adding the API key to the raw websocket URL changed the log to:

```text
403 GET /sockjs/websocket?apikey=...
```

but still did not fix startup.

## Result After Patch

After switching to SockJS client flow, OctoPrint logs changed to:

```text
403 GET /sockjs/<session>/<transport>/websocket
New connection from client: 127.0.0.1
User _api logged in on the socket from client 127.0.0.1
```

and OctoDash completed startup and worked normally on the device.

## Notes

- This was tested on a live system after ruling out config corruption, stale state, bad API key, hostname/port issues, and third-party plugin interference.
- `package-lock.json` may be cleaner if regenerated under the repo's preferred Node/npm versions.
