#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { input, confirm } from '@inquirer/prompts';
import { scanProject, formatBytes } from './scanner';
import { promptAndClean } from './cleaner';
import path from 'path';

const program = new Command();

program
  .name('antimatter')
  .description('A CLI tool to scan and remove unnecessary files and heavy folders from projects.')
  .version('1.0.0');

program
  .argument('[directory]', 'The directory to scan')
  .action(async (directory) => {
    const banner = `

   ▄████████ ███▄▄▄▄       ███      ▄█   ▄▄▄▄███▄▄▄▄      ▄████████     ███      ███    █▄     ▄████████    ▄████████
  ███    ███ ███▀▀▀██▄  ▀█████████▄ ███ ▄██▀▀▀███▀▀▀██▄   ███    ███ ▀█████████▄ ███    ███   ███    ███   ███    ███
  ███    ███ ███   ███     ▀███▀▀██ ███▌███   ███   ███   ███    ███    ▀███▀▀██ ███    ███   ███    █▀    ███    ███
  ███    ███ ███   ███      ███   ▀ ███▌███   ███   ███   ███    ███     ███   ▀ ███    ███  ▄███▄▄▄      ▄███▄▄▄▄██▀
▀███████████ ███   ███      ███     ███▌███   ███   ███ ▀███████████     ███     ███    ███ ▀▀███▀▀▀     ▀▀███▀▀▀▀▀
  ███    ███ ███   ███      ███     ███ ███   ███   ███   ███    ███     ███     ███    ███   ███    █▄  ▀███████████
  ███    ███ ███   ███      ███     ███ ███   ███   ███   ███    ███     ███     ███    ███   ███    ███   ███    ███
  ███    █▀   ▀█   █▀      █████▄  █▀   ▀█   ███   █▀    ███    █▀     █████▄  ████████▀    ██████████   ███    ███
                            ▀                                            ▀                                ███    ███
`;
    console.log(chalk.cyan.bold(banner));
    console.log(chalk.cyan('  ┌─────────────────────────────────────────────┐'));
    console.log(chalk.cyan('  │   Project Cleaning & Optimization Utility    │'));
    console.log(chalk.cyan('  │   v1.0.0  ·  MIT License  ·  @DevanshTyagi   │'));
    console.log(chalk.cyan('  └─────────────────────────────────────────────┘\n'));

    let targetDir = directory;
    
    // 1. If no directory provided, ask for it
    if (!targetDir) {
      targetDir = await input({
        message: 'Enter the path of the project you want to clean:',
        default: '.',
      });
    }

    const resolvedPath = path.resolve(process.cwd(), targetDir);
    const projectName = path.basename(resolvedPath) || resolvedPath;

    // 2. Ask for confirmation with project name
    const shouldProceed = await confirm({
      message: `📦 Ready to scan ${chalk.cyan.bold(projectName)}?`,
      default: true,
    });

    if (!shouldProceed) {
      console.log(chalk.gray('\n👋 Operation cancelled. See you next time!'));
      return;
    }

    console.log(chalk.gray(`\n🔍 Searching: ${chalk.underline(resolvedPath)}\n`));
    const spinner = ora({
      text: 'Digging through files...',
      color: 'cyan'
    }).start();

    try {
      const results = await scanProject(resolvedPath);
      
      const totalSize = results.reduce((acc, curr) => acc + curr.size, 0);
      
      if (results.length > 0) {
        spinner.succeed(chalk.cyan(`Scan complete! Found ${chalk.bold(results.length)} items · ${chalk.bold(formatBytes(totalSize))} recoverable\n`));
      } else {
        spinner.succeed('Scan complete!');
      }

      await promptAndClean(results);
    } catch (error: any) {
      spinner.fail('An error occurred during scanning.');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program.parse(process.argv);
