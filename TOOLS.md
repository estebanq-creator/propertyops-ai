# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Paperclip Local

- When talking to the local Paperclip API, use single-line `curl` commands.
- Do not pipe `curl` output into `python`, `python3`, shell interpreters, or any other executable.
- If you need to inspect JSON, either read the raw response directly or use a separate safe step that does not execute downloaded content.
- Local Paperclip API root: `http://127.0.0.1:3100/api`

## Discord Routing

- **Status Updates**: Channel 1491798095774748753 (webhook: 1491799722065662193)
- **Intelligence Reports**: Channel 1491501376042176552
- **Telegram**: Disabled for status/intelligence reports (use Discord only)
