# Basic Web Admin Starter Template

### Vue , Vue-Router , Vuex , Vuetify

## Setting up Workspace

To start contributing, the following must be observe

> NOTE: The project is assuming you are using VSCode as your editor for this project.

* Needed plugins must be installed
* You must work using the project's vscode's workspace `vscode/vcorp-admin.code-workspace`
* You should not edit restricted files

### Needed VSCode Plugins

* EditorConfig for VS Code
* ESLint
* Prettier - Code Formatter
* Sass
* Vetur
* DotENV

Optional Plugins

* indent-rainbow

### Restricted files

* `vscode/vcorp-admin.code-workspace`
* all dot files, except to your `.env` file
* `babel.config.js`
* `bitbucket-pipelines.yml`
* `cypress.json`
* `jest.config.js`
* `now.json`
* `package-lock.json`, discard changes if you install new package
* `vue.config.js`
* `.browserslistrc`
* `.editorconfig`

## Running locally

Install npm packages

```bash
npm install
```

> Note: Make sure all the packages in `dependencies` and `devDependencies` are all installed.

Setup environment variables

```bash
cp .env.default .env
```

Run the app

```bash
npm run serve
```

> Note: If you are developing it locally run `npm run dev` instead
