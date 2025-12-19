import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources, replaceArrayElements } from '../helper/util'

export function moveDown(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.moveDown', async function (value: Resource) {
    const items = await getCurrentResources()
    const currentIndex = items.findIndex((i) => i.filePath === value.value)

    if (currentIndex === -1 || currentIndex === items.length - 1) {
      return
    }

    let resources = replaceArrayElements(items, currentIndex, currentIndex + 1)

    configMgr.save('resources', resources).catch(console.warn)
  })
}
