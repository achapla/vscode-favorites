import * as vscode from 'vscode'
import * as path from 'path'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources } from '../helper/util'

export function renameFavorite(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.renameFavorite', async (item: Resource) => {
    if (!item) {
      return vscode.window.showWarningMessage('You have to choose a favorite to rename')
    }

    // Get current display name (custom name or basename)
    const currentName = item.label as string
    const baseName = path.basename(item.value)

    // Show input box pre-filled with current name
    const newName = await vscode.window.showInputBox({
      prompt: 'Enter custom name for this favorite',
      value: currentName,
      placeHolder: baseName,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Name cannot be empty'
        }
        return null
      }
    })

    if (newName === undefined) {
      return // User cancelled
    }

    // Find and update the resource in config
    const resources = getCurrentResources()
    const index = resources.findIndex(r => r.filePath === item.value)

    if (index === -1) {
      return vscode.window.showWarningMessage('Could not find favorite in configuration')
    }

    // If new name equals basename, remove custom name (revert to default)
    // Otherwise, save the custom name
    resources[index].name = newName === baseName ? undefined : newName

    await configMgr.save('resources', resources).catch(console.warn)
    favoritesProvider.refresh()

    vscode.window.showInformationMessage(`Renamed to: ${newName}`)
  })
}
