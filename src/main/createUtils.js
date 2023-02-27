import { simpleGit } from 'simple-git';
import path from 'path';
import * as fs from 'fs';

const __VERSION = "_V1.1.0"

const PWABRANCH = 'origin/PWA' + __VERSION
const BASEUIBRANCH = 'origin/BaseUI' + __VERSION

const TAILWINDBRANCH = 'origin/Tailwind' + __VERSION
const TAILWINDDAISYBRANCH = 'origin/TailwindDaisy' + __VERSION
const TAILWINDFLOWBITEBRANCH = 'origin/TailwindFlowbite' + __VERSION

const UNOBRANCH = 'origin/UnoCss' + __VERSION
const UNODAISYBRANCH = 'origin/UnoCssDaisy' + __VERSION

const getCssBranch = (css) => {
  let frameworkBranch = null
  let uiBranch = null
  switch (css.framework) {
    case "TailwindCss":
      frameworkBranch = TAILWINDBRANCH
      uiBranch = css.ui === "DaisyUi" ? TAILWINDDAISYBRANCH : css.ui === "FlowBite" ? TAILWINDFLOWBITEBRANCH : null
      break;
    case "UnoCss":
      frameworkBranch = UNOBRANCH
      uiBranch = css.ui === "DaisyUi" ? UNODAISYBRANCH : null
      break;
    default:
      break;
  }
  return [frameworkBranch, uiBranch]
}

const resolveConflict = (resolve, fileString, frameworkBranch) => {
  const reg = new RegExp(`<<<<<<< HEAD\r\\\n|=======\\r\\n|>>>>>>> ${frameworkBranch.replace("+", "\\+")}\\r\\n`, 'gm')
  let newArray = fileString.split(reg);

  let deleteHunk
  let index = 0
  while (newArray[(index * 4) + 1]) {

    deleteHunk = Array.isArray(resolve) ? resolve[index] : resolve

    if (deleteHunk != null) {
      newArray[(index * 4) + deleteHunk] = ''
    }
    index += 1
  }
  return newArray.join("")
}

const resolveConflictBothRecursive = async (targetDir, frameworkBranch, err) => {
  targetDir = path.join(targetDir, "/neo-t3-sveltekit-scaffold/")
  err.git.merges.forEach(element => {
    let currTargetPath = path.join(targetDir, element)

    let data = fs.readFileSync(currTargetPath, 'utf-8');
    let newValue = resolveConflict(null, data, frameworkBranch)
    fs.writeFileSync(currTargetPath, newValue, 'utf-8');
  });
}

const resolveConflictTheirsRecursive = async (targetDir, frameworkBranch, err) => {
  targetDir = path.join(targetDir, "/neo-t3-sveltekit-scaffold/")
  err.git.merges.forEach(element => {
    let currTargetPath = path.join(targetDir, element)

    let data = fs.readFileSync(currTargetPath, 'utf-8');
    let newValue = resolveConflict(1, data, frameworkBranch)
    fs.writeFileSync(currTargetPath, newValue, 'utf-8');
  });
}

const cloneRepo = async (targetDir) => {

  const gitClone = simpleGit();
  await gitClone.clone("https://github.com/MahmoodKhalil57/neo-t3-sveltekit-scaffold.git")
  const gitMerge = simpleGit({ baseDir: path.join(targetDir, 'neo-t3-sveltekit-scaffold') });

  await gitMerge.merge([PWABRANCH])
  await gitMerge.merge([BASEUIBRANCH])

  return gitMerge
}

const getApiBranch = (apiArray) => {
  let branch = `origin/${apiArray.join("")}+BaseUI${__VERSION}`
  return branch
}

const mergeApi = async (dirs, apiArray, gitMerge) => {
  const apiBranch = getApiBranch(apiArray)
  await gitMerge.merge(['--no-ff', apiBranch]).catch(async (err) => {
    await resolveConflictBothRecursive(dirs.targetDir, apiBranch, err)
    await gitMerge.add("--all").commit(`Merge remote-tracking branch '${apiBranch}' into origin/Head`)
  })
  return gitMerge
}

const mergeCss = async (dirs, css, gitMerge) => {
  let [cssFrameworkBranch, cssUiFramworkBranch] = getCssBranch(css)

  if (cssFrameworkBranch) {
    if (!cssUiFramworkBranch) {
      if (cssFrameworkBranch === UNOBRANCH) {
        await gitMerge.merge(['--no-ff', cssFrameworkBranch.replace("_", "+PWA_")]).catch(async (err) => {
          await resolveConflictBothRecursive(dirs.targetDir, cssFrameworkBranch.replace("_", "+PWA_"), err)
          await gitMerge.add("--all").commit(`Merge remote-tracking branch '${cssFrameworkBranch.replace("_", "+PWA_")}' into origin/Head`)
        })
      }
      await gitMerge.merge(['--no-ff', cssFrameworkBranch.replace("_", "+BaseUI_")]).catch(async (err) => {
        await resolveConflictBothRecursive(dirs.targetDir, cssFrameworkBranch.replace("_", "+BaseUI_"), err)
        await gitMerge.add("--all").commit(`Merge remote-tracking branch '${cssFrameworkBranch.replace("_", "+BaseUI_")}' into origin/Head`)
      })
    } else {
      if (cssUiFramworkBranch === UNODAISYBRANCH) {
        await gitMerge.merge(['--no-ff', cssUiFramworkBranch.replace("_", "+PWA_")]).catch(async (err) => {
          await resolveConflictBothRecursive(dirs.targetDir, cssUiFramworkBranch.replace("_", "+PWA_"), err)
          await gitMerge.add("--all").commit(`Merge remote-tracking branch '${cssUiFramworkBranch.replace("_", "+PWA_")}' into origin/Head`)

        })
      }
      await gitMerge.merge(['--no-ff', cssUiFramworkBranch.replace("_", "+BaseUI_")]).catch(async (err) => {
        cssUiFramworkBranch === TAILWINDDAISYBRANCH ?
          await resolveConflictTheirsRecursive(dirs.targetDir, cssUiFramworkBranch.replace("_", "+BaseUI_"), err) :
          await resolveConflictBothRecursive(dirs.targetDir, cssUiFramworkBranch.replace("_", "+BaseUI_"), err)

        await gitMerge.add("--all").commit(`Merge remote-tracking branch '${cssUiFramworkBranch.replace("_", "+BaseUI_")}' into origin/Head`)
      })
    }
  }
}

const fixPackage = async (dirs, schema) => {
  const DEPENDENCIES = {
    init: {
      dev: {
        "@sveltejs/adapter-auto": "^2.0.0",
        "@sveltejs/kit": "^1.5.0",
        "@typescript-eslint/eslint-plugin": "^5.45.0",
        "@typescript-eslint/parser": "^5.45.0",
        "eslint": "^8.28.0",
        "eslint-config-prettier": "^8.5.0",
        "eslint-plugin-svelte3": "^4.0.0",
        "prettier": "^2.8.0",
        "prettier-plugin-svelte": "^2.8.1",
        "svelte": "^3.54.0",
        "svelte-check": "^3.0.1",
        "tslib": "^2.4.1",
        "typescript": "^4.9.3",
        "vite": "^4.0.0"
      }
    },

    PWA: {
      dev: {
        "@sveltejs/adapter-static": "^2.0.1",
        "@types/cookie": "^0.5.1",
        "@vite-pwa/sveltekit": "^0.1.3",
        "svelte-preprocess": "^5.0.1",
        "vite-plugin-pwa": "^0.14.4",
        "workbox-precaching": "^6.5.4",
        "workbox-routing": "^6.5.4",
        "workbox-window": "^6.5.4"
      }
    },

    TRPC: {
      dev: {
        "@sveltejs/adapter-node": "^1.2.0",
      },
      dep: {
        "@trpc/client": "^10.12.0",
        "@trpc/server": "^10.12.0",
        "@types/ws": "^8.5.4",
        "trpc-sveltekit": "^3.4.2",
        "trpc-transformer": "^2.2.2",
        "ws": "^8.12.1",
        "zod": "^3.20.6"
      }
    },

    Prisma: {
      dev: {
        "prisma": "^4.10.1",
      },
      dep: {
        "@prisma/client": "^4.10.1"
      }
    },

    AuthJs: {
      dep: {
        "@auth/core": "^0.5.0",
        "@auth/sveltekit": "^0.2.2"
      }
    },

    TailwindCss: {
      dev: {
        "autoprefixer": "^10.4.13",
        "postcss": "^8.4.21",
        "tailwindcss": "^3.2.7",
      }
    },

    TailwindCss_DaisyUi: {
      dep: {
        "daisyui": "^2.51.1"
      }
    },

    TailwindCss_FlowBite: {
      dev: {
        "flowbite": "^1.6.3",
        "flowbite-svelte": "^0.30.4",
      }
    },

    UnoCss: {
      dev: {
        "autoprefixer": "^10.4.13",
        "postcss": "^8.4.21",
        "postcss-load-config": "^4.0.1",
        "svelte-preprocess": "^5.0.1",
        "unocss": "^0.50.1",
      }
    },

    UnoCss_DaisyUi: {
      dev: {
        "unocss-preset-daisy": "^1.2.0",
        "@kidonng/daisyui": "2.50.1-0",
      }
    },
  }

  let devDependencies = {}
  let dependencies = {}

  devDependencies = { ...devDependencies, ...DEPENDENCIES.init.dev, ...DEPENDENCIES.PWA.dev };

  console.log(schema)
  if (schema?.apiArray)
    for (let apiName in schema.apiArray) {
      switch (apiName) {
        case "TRPC":
          devDependencies = { ...devDependencies, ...DEPENDENCIES.TRPC.dev };
          dependencies = { ...dependencies, ...DEPENDENCIES.TRPC.dep };
          break;
        case "Prisma":
          devDependencies = { ...devDependencies, ...DEPENDENCIES.Prisma.dev };
          dependencies = { ...dependencies, ...DEPENDENCIES.Prisma.dep };
          break;
        case "AuthJs":
          devDependencies = { ...devDependencies, ...DEPENDENCIES.AuthJs.dev };
          break
        default:
          break
      }
    }

  if (schema?.css?.framework === "TailwindCss") {
    devDependencies = { ...devDependencies, ...DEPENDENCIES.TailwindCss.dev };
    if (schema?.css?.ui === "FlowBite") {
      devDependencies = { ...devDependencies, ...DEPENDENCIES.TailwindCss_FlowBite.dev };
    } else if (schema?.css?.ui === "DaisyUi") {
      dependencies = { ...dependencies, ...DEPENDENCIES.TailwindCss_DaisyUi.dep };
    }
  } else if (schema?.css.framework === "UnoCss") {
    devDependencies = { ...devDependencies, ...DEPENDENCIES.UnoCss.dev };
    if (schema?.css?.ui === "DaisyUi") {
      devDependencies = { ...devDependencies, ...DEPENDENCIES.UnoCss_DaisyUi.dev };
    }
  }
  let data = fs.readFileSync(path.join(dirs.packageDir, "/src/main/packageTemplate.txt"), 'utf-8');
  data = data.replace("[DEVDEP]", JSON.stringify({ devDependencies }).slice(1, -1) + (Object.keys(dependencies).length ? ',' : ''))
  data = data.replace("[DEP]", Object.keys(dependencies).length ? JSON.stringify({ dependencies }).slice(1, -1) : '')


  const targetPackagePath = path.join(dirs.targetDir, "/neo-t3-sveltekit-scaffold", "/package.json")
  fs.writeFileSync(targetPackagePath, data, 'utf-8', 'w');
}

export default {
  cloneRepo,
  mergeApi,
  mergeCss,
  fixPackage
}