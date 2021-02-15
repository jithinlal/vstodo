import * as vscode from 'vscode';
import { authenticate } from './authenticate';
import { HelloWorldPanel } from './HelloWorld';
import { SidebarProvider } from './SidebarProvider';
import { TokenManager } from './TokenManager';

export function activate(context: vscode.ExtensionContext) {
	TokenManager.globalState = context.globalState;

	const sidebarProvider = new SidebarProvider(context.extensionUri);

	const item = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
	);
	item.text = '$(beaker) Add Todo';
	item.command = 'vstodo.addTodo';
	item.show();

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'vstodo-sidebar',
			sidebarProvider,
		),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('vstodo.addTodo', () => {
			const { activeTextEditor } = vscode.window;

			if (!activeTextEditor) {
				vscode.window.showInformationMessage('No active text editor!');
				return;
			}

			const text = activeTextEditor.document.getText(
				activeTextEditor.selection,
			);

			if (text === '') {
				return;
			}

			sidebarProvider._view?.webview.postMessage({
				type: 'new-todo',
				value: text,
			});
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('vstodo.authenticate', () => {
			authenticate(() => {});
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('vstodo.refreshWebView', () => {
			HelloWorldPanel.kill();
			HelloWorldPanel.createOrShow(context.extensionUri);
		}),
	);
}

export function deactivate() {}
