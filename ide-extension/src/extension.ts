import * as vscode from 'vscode';
import { scanProject, formatBytes, ScanResult } from './scanner';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('antimatter.clean', async (uri?: vscode.Uri) => {
    
    // Determine the root path to scan
    let targetPath: string | undefined;
    
    if (uri && uri.fsPath) {
      targetPath = uri.fsPath;
    } else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
      targetPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    } else {
      // Prompt user to select a folder
      const folders = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Select Project to Clean'
      });
      if (folders && folders.length > 0) {
        targetPath = folders[0].fsPath;
      }
    }

    if (!targetPath) {
      vscode.window.showInformationMessage('Antimatter: No project selected for cleaning.');
      return;
    }

    // Run the scan with a progress indicator
    let results: ScanResult[] = [];
    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Antimatter: Scanning project...",
        cancellable: false
      }, async (progress) => {
        results = await scanProject(targetPath!, progress);
      });
    } catch (err: any) {
      vscode.window.showErrorMessage(`Antimatter Scan Failed: ${err.message}`);
      return;
    }

    if (results.length === 0) {
      vscode.window.showInformationMessage('✨ Antimatter: Your project is spotless! Nothing to clean.');
      return;
    }

    // Calculate total size found
    const totalSize = results.reduce((acc, curr) => acc + curr.size, 0);

    // Prepare QuickPick items
    interface ScanQuickPickItem extends vscode.QuickPickItem {
      resultPath: string;
      resultSize: number;
    }

    const quickPickItems: ScanQuickPickItem[] = results.map(r => ({
      label: r.type === 'directory' ? `$(folder) ${r.description}` : `$(file) ${r.description}`,
      description: formatBytes(r.size),
      detail: r.path,
      resultPath: r.path,
      resultSize: r.size,
      picked: false
    }));

    // Show QuickPick to user
    const selectedItems = await vscode.window.showQuickPick(quickPickItems, {
      canPickMany: true,
      placeHolder: `Found ${results.length} items (${formatBytes(totalSize)}). Select items to purge...`,
      ignoreFocusOut: true,
      title: 'Antimatter: Select Junk Files'
    });

    if (!selectedItems || selectedItems.length === 0) {
      vscode.window.showInformationMessage('Antimatter: Operation cancelled. No files deleted.');
      return;
    }

    // Confirm Deletion
    const totalSelectedSize = selectedItems.reduce((acc, curr) => acc + curr.resultSize, 0);
    const confirmation = await vscode.window.showWarningMessage(
      `⚠️ Are you sure you want to PERMANENTLY delete ${selectedItems.length} items (${formatBytes(totalSelectedSize)})? This action cannot be undone.`,
      { modal: true },
      'Purge Antimatter'
    );

    if (confirmation !== 'Purge Antimatter') {
      vscode.window.showInformationMessage('Antimatter: Operation cancelled.');
      return;
    }

    // Execute Deletion with Progress
    let deletedCount = 0;
    let failedCount = 0;

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Antimatter: Purging files...",
      cancellable: false
    }, async (progress) => {
      const step = 100 / selectedItems.length;
      for (const item of selectedItems) {
        progress.report({ message: `Deleting ${item.label}...`, increment: step });
        try {
          await vscode.workspace.fs.delete(vscode.Uri.file(item.resultPath), { recursive: true, useTrash: false });
          deletedCount++;
        } catch (err) {
          failedCount++;
          console.error(`Failed to delete ${item.resultPath}:`, err);
        }
      }
    });

    // Final Report
    if (failedCount > 0) {
      vscode.window.showWarningMessage(`✨ Antimatter: Purged ${deletedCount} items, but failed to delete ${failedCount} items. Check permissions.`);
    } else {
      vscode.window.showInformationMessage(`✨ Antimatter: Success! Reclaimed ${formatBytes(totalSelectedSize)} of disk space.`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
