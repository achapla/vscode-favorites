import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources } from '../helper/util'

export function moveToBottom(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.moveToBottom', async function (value: Resource) {
    const items = await getCurrentResources()
    const currentIndex = items.findIndex((i) => i.filePath === value.value)

    if (currentIndex === -1 || currentIndex === items.length - 1) {
      return
    }

    items.push(items[currentIndex])
    items.splice(currentIndex, 1)

    configMgr.save('resources', items).catch(console.warn)
  })
}
