#!/usr/bin/env node

import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import { Command } from 'commander';

// 1. Define the command-line interface with commander
const program = new Command();

program
  .version('1.0.0')
  .description('A blazing fast CLI tool to create a new npm package')
  .argument('<packageName>', 'The name of the package to create')
  .option('--pm <manager>', 'Specify the package manager (npm, pnpm, yarn)', 'pnpm') // Default to 'pnpm'
  .action((packageName, options) => {
    console.log(`🚀 Creating package: ${packageName}`);
    scaffoldProject(packageName, options);
  });

program.parse(process.argv);

// 2. Main scaffolding logic
function scaffoldProject(projectName: string, options: { pm: string }) {
  const projectDir = path.join(process.cwd(), projectName);
  const templateDir = path.join(__dirname, '../template');

  if (fs.existsSync(projectDir)) {
    console.error(`❌ Error: Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  // Copy template files
  fs.copySync(templateDir, projectDir);

  // Modify the package.json with the project name
  const packageJsonPath = path.join(projectDir, 'package.json');
  const packageJson = fs.readJsonSync(packageJsonPath);
  packageJson.name = projectName;
  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });

  installDependencies(projectDir, options.pm);
}

// 3. Dependency installation logic
function installDependencies(projectDir: string, packageManager: string) {
  // Validate the package manager
  if (!['npm', 'pnpm', 'yarn'].includes(packageManager)) {
      console.error(`❌ Error: Invalid package manager "${packageManager}". Please use npm, pnpm, or yarn.`);
      process.exit(1);
  }

  console.log(`📦 Initializing git and installing dependencies with ${packageManager}...`);
  try {
    execSync('git init', { cwd: projectDir });
    execSync(`${packageManager} install`, { cwd: projectDir, stdio: 'inherit' });

    console.log(`\n✅ Success! Your new package "${path.basename(projectDir)}" is ready.`);
    console.log(`\nNavigate to your project:\n  cd ${path.basename(projectDir)}`);
    console.log('\nStart coding! 🔥');
  } catch (error) {
    console.error(`❌ Error initializing git or installing dependencies with ${packageManager}.`, error);
  }
}