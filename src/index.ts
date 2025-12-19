// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { FavoritesProvider } from './provider/FavoritesProvider'
import configMgr from './helper/configMgr'

import {
  addToFavorites,
  deleteFavorite,
  renameFavorite,
  moveUp,
  moveDown,
  moveToTop,
  moveToBottom,
  refresh,
  revealInOS_mac,
  revealInOS_windows,
  revealInOS_other,
  handleItemClick,
} from './command'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "favorites" is now active!')

  vscode.commands.executeCommand('setContext', 'ext:allFavoriteViews', ['favorites', 'favorites-full-view'])

  configMgr.onConfigChange(() => {
    favoritesProvider.refresh()
  })

  const favoritesProvider = new FavoritesProvider()

  vscode.window.createTreeView('favorites', { treeDataProvider: favoritesProvider, showCollapseAll: true })
  vscode.window.createTreeView('favorites-full-view', {
    treeDataProvider: favoritesProvider,
    showCollapseAll: true,
  })

  vscode.workspace.onDidChangeConfiguration(
    () => {
      favoritesProvider.refresh()
    },
    this,
    context.subscriptions
  )

  context.subscriptions.push(addToFavorites())
  context.subscriptions.push(deleteFavorite())
  context.subscriptions.push(renameFavorite(favoritesProvider))
  context.subscriptions.push(revealInOS_mac())
  context.subscriptions.push(revealInOS_windows())
  context.subscriptions.push(revealInOS_other())
  context.subscriptions.push(handleItemClick(favoritesProvider))
  context.subscriptions.push(moveUp(favoritesProvider))
  context.subscriptions.push(moveDown(favoritesProvider))
  context.subscriptions.push(moveToTop(favoritesProvider))
  context.subscriptions.push(moveToBottom(favoritesProvider))
  context.subscriptions.push(refresh(favoritesProvider))
}

// this method is called when your extension is deactivated
export function deactivate() {}
