import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources } from '../helper/util'

export function moveToTop(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.moveToTop', async function (value: Resource) {
    const items = await getCurrentResources()
    const currentIndex = items.findIndex((i) => i.filePath === value.value)

    if (currentIndex <= 0) {
      return
    }

    items.unshift(items[currentIndex])
    items.splice(currentIndex + 1, 1)

    configMgr.save('resources', items).catch(console.warn)
  })
}
