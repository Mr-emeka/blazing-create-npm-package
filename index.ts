#!/usr/-bin/env node

import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';

async function main() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter the project name:',
      validate: (input) => (input ? true : 'Project name cannot be empty.'),
    },
    {
      type: 'input',
      name: 'description',
      message: 'Enter the project description:',
    },
    {
      type: 'input',
      name: 'author',
      message: 'Enter the author name:',
    },
    // This is the new question to select the package type
    {
      type: 'list',
      name: 'packageType',
      message: 'Select the type of package you are creating:',
      choices: ['Framework', 'CLI tool'],
      default: 'Framework',
    },
  ]);

  const projectDir = path.join(process.cwd(), answers.projectName);
  const templateDir = path.join(__dirname, '../template');

  // Copy template files
  fs.copySync(templateDir, projectDir);

  // --- Logic to configure the package based on the selected type ---
  
  // 1. Modify the package.json with user answers
  const packageJsonPath = path.join(projectDir, 'package.json');
  const packageJson = fs.readJsonSync(packageJsonPath);

  packageJson.name = answers.projectName;
  packageJson.description = answers.description;
  packageJson.author = answers.author;

  // 2. If it's a CLI tool, add the 'bin' field to package.json
  if (answers.packageType === 'CLI tool') {
    // A TypeScript project compiles to `dist`, so the executable is `dist/index.js`
    packageJson.bin = {
      [answers.projectName]: 'dist/index.js',
    };
  }

  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });

  // 3. If it's a CLI tool, add a shebang to the main src/index.ts file
  if (answers.packageType === 'CLI tool') {
    const mainFilePath = path.join(projectDir, 'src/index.ts');
    let mainFileContent = fs.readFileSync(mainFilePath, 'utf-8');
    mainFileContent = `#!/usr/bin/env node\n\n${mainFileContent}`;
    fs.writeFileSync(mainFilePath, mainFileContent);
  }

  // --- End of new logic ---

  // Initialize git and install dependencies
  execSync('git init', { cwd: projectDir });
  execSync('pnpm install', { cwd: projectDir, stdio: 'inherit' });

  console.log(`\n✅ Success! Your new package "${answers.projectName}" is ready.`);
  console.log(`\nNavigate to your project:\n  cd ${answers.projectName}`);
  console.log('\nStart coding! 🔥');
}

main().catch((error) => {
  console.error('An error occurred:', error);
});
