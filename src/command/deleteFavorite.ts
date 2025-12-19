import * as vscode from 'vscode'

import { Resource } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources, pathResolve } from '../helper/util'
import { ItemInSettingsJson } from '../model'

export function deleteFavorite() {
  return vscode.commands.registerCommand('favorites.deleteFavorite', (value?: Resource | vscode.Uri) => {
    if (!value) {
      if (!vscode.window.activeTextEditor) {
        return vscode.window.showWarningMessage('You have to choose a resource first')
      }
      value = vscode.window.activeTextEditor.document.uri
    }

    const previousResources = getCurrentResources()

    const uri = (<Resource>value).resourceUri || <vscode.Uri>value

    if (uri.scheme === 'file') {
      const fsPath = (<Resource>value).value || (<vscode.Uri>value).fsPath

      configMgr
        .save(
          'resources',
          previousResources.filter((r) => {
            return r.filePath !== fsPath && pathResolve(r.filePath) !== fsPath
          })
        )
        .catch(console.warn)
    } else {
      // Not a file, so remove the stringified uri
      configMgr
        .save(
          'resources',
          previousResources.filter((r) => {
            return r.filePath !== uri.toString()
          })
        )
        .catch(console.warn)
    }
  })
}
