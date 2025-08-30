# Blazing Create NPM Package

A fast and simple CLI tool to scaffold and create npm packages quickly with TypeScript support.

## Features

- Create npm packages with a single command
- Supports both ESM and CJS builds
- Generates TypeScript definitions automatically
- Includes CLI feedback with colors and spinners

## Usage via NPX

You don’t need to install globally. Just run:

```bash
npx blazing-create-npm-package my-new-package
```

## 🤝 Contributing

Please read our [Contributing Guide](https://github.com/Mr-emeka/blazing-create-npm-package/blob/main/CONTRIBUTING.md) before submitting a PR.

All contributions should be made against the development branch (❌ not main).

## 🧪 Testing Locally

Depending on your package manager, here’s how to build, link, test, and remove the package locally:

| Package Manager | Build Command    | Link Globally        | Remove Link                                       | Check Global Installs          |
| --------------- | ---------------- | -------------------- | ------------------------------------------------- | ------------------------------ |
| **pnpm**        | `pnpm run build` | `pnpm link --global` | `pnpm remove --global blazing-create-npm-package` | `pnpm list --global --depth 0` |
| **npm**         | `npm run build`  | `npm link`           | `npm unlink -g blazing-create-npm-package`        | `npm list -g --depth=0`        |
| **yarn**        | `yarn build`     | `yarn link`          | `yarn unlink blazing-create-npm-package`          | `yarn global list`             |
| **bun**         | `bun run build`  | `bun link`           | `bun unlink blazing-create-npm-package`           | `bun pm ls -g`                 |

After linking globally, run the CLI with:

```bash
blazing-create-npm-package <project-name>
```

## 🐛 Issues

👉 If you’d like to contribute but don’t know where to start:

Check out [open issues](https://github.com/Mr-emeka/blazing-create-npm-package/issues).

Look for issues labeled good first issue or help wanted.

If you spot a bug or have a feature idea, feel free to create a new issue.

We’d love your help in making Blazing Create NPM Package even better 🚀
