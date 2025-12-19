import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'

// Unified click handler for both files and folders in the favorites tree
// - Files: Single-click opens preview, double-click opens permanent
// - Folders: Both single and double click reveal in Explorer sidebar
export function handleItemClick(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.handleItemClick', async function (resource: Resource) {
    const isFolder = resource.contextValue.includes('.dir')

    if (isFolder) {
      // Folder click handling: always reveal in sidebar
      await vscode.commands.executeCommand('revealInExplorer', resource.uri)
    } else {
      // File click handling (existing logic from open.ts)
      let usePreview = <boolean>vscode.workspace.getConfiguration('workbench.editor').get('enablePreview')

      if (usePreview) {
        usePreview = !wasFileDoubleClick(resource, favoritesProvider)
      }

      await vscode.commands.executeCommand('vscode.open', resource.uri, { preview: usePreview })
    }
  })
}

// Return true if previously called with the same file within the past 0.5 seconds
function wasFileDoubleClick(resource: Resource, favoritesProvider: FavoritesProvider): boolean {
  let result = false
  if (favoritesProvider.lastOpened) {
    const isTheSameUri = (favoritesProvider.lastOpened.uri.toString() === resource.uri.toString())
    const dateDiff = <number>(<any>new Date() - <any>favoritesProvider.lastOpened.date)
    result = isTheSameUri && dateDiff < 500
  }

  favoritesProvider.lastOpened = {
    uri: resource.uri,
    date: new Date()
  }
  return result
}
