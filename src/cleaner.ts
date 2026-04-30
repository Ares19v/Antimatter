import { checkbox } from '@inquirer/prompts';
import fs from 'fs/promises';
import chalk from 'chalk';
import { ScanResult, formatBytes } from './scanner';

export async function promptAndClean(results: ScanResult[]): Promise<void> {
  if (results.length === 0) {
    console.log(chalk.cyan('✨ Your project is spotless! Nothing to clean.'));
    return;
  }

  const choices = results.map(result => {
    const icon = result.type === 'directory' ? '📁' : '📄';
    return {
      name: `${icon} ${chalk.white(result.description)} ${chalk.cyan.dim(`(${formatBytes(result.size)})`)}`,
      value: result.path,
      checked: false,
    };
  });

  const selectedPaths = await checkbox({
    message: '✨ Select items to purge:',
    choices,
    theme: {
      helpMode: 'always'
    }
  });

  if (selectedPaths.length === 0) {
    console.log(chalk.blue('No items selected. Exiting safely.'));
    return;
  }

  let freedSpace = 0;
  console.log(); // empty line

  for (const itemPath of selectedPaths) {
    const item = results.find(r => r.path === itemPath);
    if (!item) continue;

    try {
      await fs.rm(item.path, { recursive: true, force: true });
      freedSpace += item.size;
      console.log(chalk.green(`✓ Deleted: ${item.path}`));
    } catch (err: any) {
      console.log(chalk.red(`✗ Failed to delete ${item.path}: ${err.message}`));
    }
  }

  console.log(chalk.cyan.bold(`\n✨ Done! You just reclaimed ${formatBytes(freedSpace)} of disk space!`));
}
