import * as vscode from 'vscode'
import { isMultiRoots, getSingleRootPath, getCurrentResources } from '../helper/util'
import configMgr from '../helper/configMgr'
import { ItemInSettingsJson } from '../model'

export function addToFavorites() {
  return vscode.commands.registerCommand('favorites.addToFavorites', async (fileUri?: vscode.Uri) => {
    if (!fileUri) {
      if (!vscode.window.activeTextEditor) {
        return vscode.window.showWarningMessage('You have to choose a resource first')
      }
      fileUri = vscode.window.activeTextEditor.document.uri
    }

    const fileName = fileUri.fsPath

    const previousResources = getCurrentResources()

    // Store the stringified uri for any resource that isn't a file
    const newResource =
      fileUri.scheme !== 'file'
        ? fileUri.toString()
        : isMultiRoots()
        ? fileName
        : fileName.substr(getSingleRootPath().length + 1)

    if (previousResources.some((r) => r.filePath === newResource)) {
      return
    }

    await configMgr
      .save(
        'resources',
        previousResources.concat([
          { filePath: newResource },
        ] as Array<ItemInSettingsJson>)
      )
      .catch(console.warn)
  })
}
