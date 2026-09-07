# Desktop Development Router Profile

## Overview
Routes desktop applications across Windows, macOS, and cross-platform native containers.

## Supported Desktop Framework Authorities (Select Exactly One)
1. **Windows / WinUI**: `microsoft-winui`
2. **macOS Native**: `openai-build-macos-apps`
3. **Flutter Desktop**: `flutter-agent-plugins` + `dart-lang-skills`
4. **Tauri**: `tauri-official-guidance`
5. **Electron**: `electron-official-guidance`

## Interaction Translation
- Apply `emil-design-eng` for interaction judgment and micro-interactions, but always translate into native platform conventions (Fluent on Windows, Apple HIG on macOS, native GTK on Linux).
- Never impose mobile or macOS UI paradigms onto Windows desktop applications.

## Desktop Security Isolation
- In Tauri, verify capability definitions and deny unauthorized IPC commands.
- In Electron, ensure `contextIsolation: true`, `nodeIntegration: false`, and sanitize all IPC messages in preload scripts.
