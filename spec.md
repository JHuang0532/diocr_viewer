
tmp allows arbitrary temporary file / directory write via symbolic link `dir` parameter - https://github.com/advisories/GHSA-52f5-9888-hmc6
No fix available
node_modules/tmp
  external-editor  >=1.1.1
  Depends on vulnerable versions of tmp
  node_modules/external-editor
    @inquirer/editor  <=4.2.15
    Depends on vulnerable versions of external-editor
    node_modules/@inquirer/editor
      @inquirer/prompts  <=6.0.1
      Depends on vulnerable versions of @inquirer/editor
      node_modules/@inquirer/prompts

27 vulnerabilities (4 low, 23 high)

To address issues that do not require attention, run:
  npm audit fix

Some issues need review, and may require choosing
a different dependency.