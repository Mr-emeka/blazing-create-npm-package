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
  .option('--cli', 'Scaffold a command-line (CLI) tool package')
  .action((packageName, options) => {
    console.log(`🚀 Creating package: ${packageName}`);
    scaffoldProject(packageName, options);
  });

program.parse(process.argv);

// 2. Main scaffolding logic
function scaffoldProject(projectName: string, options: { cli?: boolean }) {
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

  // --- This is the ONLY new logic ---
  // If --cli flag is used, add the 'bin' field and a shebang
  if (options.cli) {
    // Add the bin field to package.json
    packageJson.bin = {
      [projectName]: 'dist/index.js',
    };
    
    // Add the shebang to the main src/index.ts file
    const mainFilePath = path.join(projectDir, 'src/index.ts'); // Assumes a src directory in your template
    let mainFileContent = fs.readFileSync(mainFilePath, 'utf-8');
    if (!mainFileContent.startsWith('#!/usr/bin/env node')) {
        mainFileContent = `#!/usr/bin/env node\n\n${mainFileContent}`;
        fs.writeFileSync(mainFilePath, mainFileContent);
    }
  }
  // --- End of new logic ---

  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });

  installDependencies(projectDir);
}

// 3. Dependency installation logic
function installDependencies(projectDir: string) {
  console.log('📦 Initializing git and installing dependencies with pnpm...');
  try {
    execSync('git init', { cwd: projectDir });
    execSync('pnpm install', { cwd: projectDir, stdio: 'inherit' });

    console.log(`\n✅ Success! Your new package "${path.basename(projectDir)}" is ready.`);
    console.log(`\nNavigate to your project:\n  cd ${path.basename(projectDir)}`);
    console.log('\nStart coding! 🔥');
  } catch (error) {
    console.error('❌ Error initializing git or installing dependencies.', error);
  }
}