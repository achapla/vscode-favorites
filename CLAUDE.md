# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VSCode extension that allows developers to mark files and folders (local and remote) as favorites for quick access. The extension displays favorites in a dedicated tree view in the activity bar and explorer sidebar, supporting organization into groups with various sorting options.

## Development Commands

### Build & Watch
- `pnpm build` - Clean and compile TypeScript to JavaScript (output: `out/`)
- `pnpm watch` - Watch mode for continuous compilation during development
- `pnpm clean` - Remove `out/` directory and `.vsix` files

### Packaging & Publishing
- `pnpm pk` - Build and create `.vsix` package file for distribution
- `pnpm pub` - Build and publish to VSCode Marketplace (requires credentials)

### Debugging
Use VSCode's built-in debugger with F5. The launch configuration in `.vscode/launch.json` opens an Extension Development Host window for testing.

## Architecture

### Core Components

**Entry Point** (`src/index.ts`):
- `activate()` function registers all commands and tree views
- Creates two tree views: `favorites` (explorer sidebar) and `favorites-full-view` (dedicated activity bar panel)
- Sets up configuration change listeners
- All command registrations pushed to `context.subscriptions` for proper cleanup

**Configuration Manager** (`src/helper/configMgr.ts`):
- **Dual storage mode**:
  - Multi-root workspaces or `saveSeparated=false`: Uses `.vscode/settings.json` via VSCode API
  - Single-root workspace with `saveSeparated=true`: Uses `.vscfavoriterc` file via nconf library
- Methods: `get(key)`, `save(key, value)`, `onConfigChange` event emitter
- Always check storage mode before reading/writing favorites

**Tree Data Provider** (`src/provider/FavoritesProvider.ts`):
- Implements `TreeDataProvider<Resource>` interface
- `getChildren()`: Returns favorites filtered by current group, sorted by configured order
- `refresh()`: Fires `onDidChangeTreeData` event to update UI
- `Resource` class extends `TreeItem` with contextValue patterns used for menu filtering:
  - `resource` - local file
  - `resource.dir` - local directory
  - `uri.resource` - remote file
  - `uri.resource.dir` - remote directory
  - `resourceChild` - child of collapsed directory

**Commands** (`src/command/*.ts`):
- Each command is a separate module exporting a factory function
- Mutation commands update config via `configMgr.save()` then call `favoritesProvider.refresh()`
- Navigation commands use VSCode APIs (`window.showTextDocument`, `commands.executeCommand`)
- Key commands:
  - `addToFavorites.ts` - Add file/folder to current group
  - `deleteFavorite.ts` - Remove from favorites
  - `changeGroup.ts` - Switch active group (quick pick UI)
  - `addNewGroup.ts` - Create new group
  - `toggleSort.ts` - Cycle through ASC/DESC/MANUAL sort orders
  - `moveUp/Down/ToTop/ToBottom.ts` - Reorder favorites (MANUAL sort only)
  - `revealInOS_*.ts` - Platform-specific file reveal commands
  - `open.ts` - Handle click/enter on tree items (delegates to openResource or toggle collapse)

### Configuration Properties

```typescript
{
  "favorites.resources": ItemInSettingsJson[], // [{filePath: string, group?: string}]
  "favorites.sortOrder": "ASC" | "DESC" | "MANUAL",
  "favorites.saveSeparated": boolean, // true = .vscfavoriterc, false = settings.json
  "favorites.currentGroup": string,
  "favorites.groups": string[]
}
```

### Important Patterns

**Multi-root vs Single-root Workspace**:
- Use `isMultiRoots()` from `src/helper/util.ts` to detect workspace type
- Multi-root always uses VSCode settings API, even with `saveSeparated=true`
- Single-root can use separate `.vscfavoriterc` file

**Resource URIs**:
- Local files use `file://` scheme
- Remote resources (SSH, WSL, etc.) use their respective schemes
- Always use `resource.value` property for the full URI
- `contextValue` property determines menu item visibility

**Group Management**:
- Every favorite belongs to a group (default: "Default")
- Only one group active at a time (`favorites.currentGroup`)
- Favorites from other groups are hidden in tree view
- Groups are workspace-scoped

**Sort Order Behavior**:
- ASC/DESC: Array is sorted alphabetically, move commands are disabled
- MANUAL: User-controlled order via move commands, preserved in config

## Key Files by Functionality

### Adding Features
- New commands: Create file in `src/command/`, register in `src/index.ts`, add to `package.json` contributes
- New configuration: Add to `package.json` configuration properties
- Tree view changes: Modify `src/provider/FavoritesProvider.ts`

### Bug Fixes
- Config not saving: Check `src/helper/configMgr.ts` and storage mode logic
- Tree not updating: Ensure `favoritesProvider.refresh()` is called after mutations
- Menu items wrong: Check `contextValue` patterns in `package.json` menus section
- Multi-root issues: Check `isMultiRoots()` usage and workspace folder handling

### Known Quirks
- First-time favorites addition with `saveSeparated=true` requires workspace folder to exist (see commit 1c03aea, 6d725d7)
- Context menus use regex patterns (`viewItem =~ /^resource/`) - be careful with contextValue changes
- Some commands hidden from command palette via `"when": "false"` (view-specific only)
- Tree message displays current group: `tree.message = \`Current Group: ${currentGroup}\``

## Testing Extension Changes

1. Press F5 to launch Extension Development Host
2. Open a workspace folder
3. Right-click files/folders → "Add to Favorites"
4. Verify favorites appear in activity bar (heart icon) and explorer view
5. Test group switching, sorting, and move operations
6. Check both storage modes (`.vscode/settings.json` vs `.vscfavoriterc`)

## Internationalization

UI strings are in `package.nls.json` using `%key%` references in `package.json`. Currently only English is provided.
