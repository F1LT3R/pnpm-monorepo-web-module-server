# Web Modules - Node Resolve - Pnpm Monorepo

This Repo demonstrates a Monorepo workspaces setup with [PNPM](https://pnpm.js.org/en/workspaces). It uses a Node server to resolve dependencies, where a slash is pre-pended to the Request Url.

For production deployments, the module structure can be flattened into a `modules/` directory and served via Nginx with `try_files` set to `index.mjs` or `main.mjs`.

Unfortunately, ["Named Import Maps"](https://github.com/WICG/import-maps) have not yet landed in web browsers, as this would make this solution truly [isomorphic](https://en.wikipedia.org/wiki/Isomorphic_JavaScript) - without needing any third party libraries or polyfills.

## Root Module Imports

In this example codebase, we ask the browser to fetch our module with a slash at the start.

```js
import test from '/@demo/test';
```

The Node server then resolves the package on the local file system.

1. A package map is obtained by globing for `package.json` files (ignoring `node_modules`).
2. The slash is removed from the web module's Request Url.
3. The correct `package.json` file is resolved by Node.
4. The script in the `main` field is served back to the browser.

## Tree

```plain
❯ tree -I node_modules
.
├── LICENSE
├── README.md
├── package.json
├── packages
│   ├── apps
│   │   └── demo
│   │       ├── package.json
│   │       └── src
│   │           ├── demo
│   │           │   └── test.mjs
│   │           ├── hybrids.js
│   │           ├── index.html
│   │           └── index.mjs
│   └── mods
│       └── demo
│           ├── test
│           │   ├── package.json
│           │   └── src
│           │       └── index.mjs
│           ├── test2
│           │   ├── package.json
│           │   └── src
│           │       └── index.mjs
│           ├── test3
│           │   ├── package.json
│           │   └── src
│           │       └── index.mjs
│           └── test4
│               ├── package.json
│               └── src
│                   └── index.mjs
├── pnpm-workspace.yaml
└── server
    ├── config
    │   └── mimeTypes.json
    ├── lib
    │   ├── getPackageMap.js
    │   ├── listMonorepoDeps.js
    │   ├── resolveApp.js
    │   ├── resolvePackage.js
    │   └── server.js
    ├── package-lock.json
    ├── package.json
    └── public
        └── 404.html

19 directories, 26 files
```

## The Setup

File: `.npmrc`

```
link-workspace-packages = true
shared-workspace-shrinkwrap = true
```

File: `pnpm-workspace.yaml`

```yaml
packages:
    - '**'
```

Recursive install:

```shell
❯ pnpm install -r

Scope: all 4 workspace projects
Lockfile is up-to-date, resolution step is skipped
Already up-to-date
```

## Workspaces List

The command:

```shell
pnpm list -r --json
```

Yields:

```json
❯ pnpm list -r --json
[
  {
    "name": "@voyage/monorepo"
  },
  {
    "name": "@demo/app",
    "dependencies": {
      "@demo/test": {
        "from": "@demo/test",
        "version": "link:../../mods/demo/test"
      },
      "@demo/test2": {
        "from": "@demo/test2",
        "version": "link:../../mods/demo/test2"
      }
    }
  },
  {
    "name": "@demo/test",
    "version": "0.1.0"
  },
  {
    "name": "@demo/test2",
    "version": "0.1.0"
  },
  {
    "name": "@demo/test3",
    "version": "0.1.0"
  },
  {
    "name": "@demo/test4",
    "version": "0.1.0"
  },
  {
    "name": "server",
    "version": "1.0.0",
  }
]
```

## Example Nginx Configuration

```
events { }

http {
    types {
        application/javascript  mjs;
        text/html   html;
    }

    server {
        root public;

        location / {
            try_files $uri $uri/index.html index.html;
        }

        location /modules/ {
            try_files $uri $uri/index.mjs $uri/src/index.mjs index.mjs;
        }
    }
}
```