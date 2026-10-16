# Contributing

Anyone may fork this repository and propose a change through a Pull Request.
Only the maintainer decides what is merged into the official repository and released.
Forks are independent; their changes do not update the official extension.

1. Fork the repository and create a branch for one focused change.
2. Explain the problem, resulting behavior, and any permission/privacy changes in your PR.
3. Run `node tests/regression.cjs` and syntax-check the JavaScript files.
4. Add regression coverage for safety-sensitive changes. Never submit real removal requests merely to test a contribution; use mocks or a property you own with explicit authorization.
5. Keep HTTP 404/410 gating, redirect rejection, property guards, conservative confirmation, history preservation, and wildcard rejection intact. Discuss any proposed policy change with the maintainer first.
6. Do not include credentials, private reports, account details, or personal URLs.

Changes to Chrome permissions, submission scope, storage/privacy, dependencies, workflows,
or release packaging require a clear explanation. Do not change release assets or tags in a PR.
Do not include bundled/minified or remotely loaded executable code without reviewed source.

Before merging, the maintainer reviews the diff, checks automated results, and performs
appropriate browser verification. Automated tests do not guarantee the absence of bugs.

By contributing, you agree that your contribution is licensed under the MIT license in LICENSE.
