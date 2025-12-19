import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources, replaceArrayElements } from '../helper/util'

export function moveUp(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.moveUp', async function(value: Resource) {
    const config = vscode.workspace.getConfiguration('favorites')

    const items = await getCurrentResources()
    const currentIndex = items.findIndex((i) => i.filePath === value.value)

    if (currentIndex <= 0) {
      return
    }

    let resources = replaceArrayElements(items, currentIndex, currentIndex - 1)

    config.update('sortOrder', 'MANUAL', false)
    configMgr.save('resources', resources).catch(console.warn)
  })
}
