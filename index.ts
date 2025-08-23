#!/usr/bin/env node
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";

// For __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type CLIOptions = {
  cli: boolean;
  lib: boolean;
};

type ParsedArgs = {
  projectName: string | null;
  opts: CLIOptions;
};

const templateDir = path.join(__dirname, "../template");

function printHelp(): void {
  console.log(`
${chalk.bold("Usage:")}
  npx create-npm-package <package-name> [options]

${chalk.bold("Options:")}
  --cli          Scaffold a CLI package (adds bin field, index.js entrypoint)
  --lib          Scaffold a library package (default)
  -h, --help     Show this help message

${chalk.bold("Examples:")}
  npx create-npm-package <package-name>
  npx create-npm-package <package-name> --cli
  `);
}

function exitWithError(message: string): never {
  console.error(chalk.red(`❌ ${message}`));
  process.exit(1);
}

function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);
  const opts: CLIOptions = { cli: false, lib: true };

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const projectName = args[0] ?? null;

  if (args.includes("--cli")) {
    opts.cli = true;
    opts.lib = false;
  }

  return { projectName, opts };
}

function scaffoldProject(
  projectPath: string,
  projectName: string,
  opts: CLIOptions
): void {
  const spinner = ora("📂 Scaffolding project...").start();

  try {
    fs.cpSync(templateDir, projectPath, { recursive: true });

    // Update package.json
    const pkgPath = path.join(projectPath, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as {
        name: string;
        bin?: Record<string, string>;
      };

      pkg.name = projectName;

      if (opts.cli) {
        pkg.bin = { [projectName]: "./bin/index.js" };
      }

      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    }

    spinner.succeed(`📂 Project files created successfully`);
  } catch (err) {
    spinner.fail("❌ Failed to scaffold project");
    console.error(err);
    process.exit(1);
  }
}

function installDependencies(projectPath: string, projectName: string): void {
  const spinner = ora("📦 Installing dependencies...").start();

  const child = spawn("npm", ["install"], {
    cwd: projectPath,
    stdio: "pipe",
  });

  child.stdout.on("data", (data: Buffer) => {
    spinner.text = `📦 Installing... ${data.toString().trim()}`;
  });

  child.stderr.on("data", (data: Buffer) => {
    spinner.warn(`⚠️ ${data.toString().trim()}`);
  });

  child.on("close", (code: number) => {
    if (code !== 0) {
      spinner.fail("❌ npm install failed");
      process.exit(1);
    }

    spinner.succeed("✅ Dependencies installed!");
    showNextSteps(projectName);
  });
}

function showNextSteps(projectName: string): void {
  console.log(`
🎉 Project ${chalk.green(projectName)} created successfully!

Next steps:
  cd ${projectName}
  git init
  npm run build
  npm run release
  `);
}

// ----------------- Main -----------------
const { projectName, opts } = parseArgs(process.argv);

if (!projectName) {
  exitWithError("Please provide a project name.\nRun with --help for usage.");
}

const projectPath = path.join(process.cwd(), projectName);

if (fs.existsSync(projectPath)) {
  exitWithError("Folder already exists!");
}

scaffoldProject(projectPath, projectName, opts);
installDependencies(projectPath, projectName);
