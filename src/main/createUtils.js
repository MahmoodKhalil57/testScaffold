import { simpleGit } from 'simple-git';
import path from 'path';
import * as fs from 'fs';
import { PACKAGEDATA, BRANCHES } from './constants.js'

const getCssBranch = (css) => {
  let frameworkBranch = null
  let uiBranch = null
  switch (css.framework) {
    case "TailwindCss":
      frameworkBranch = BRANCHES.TAILWINDBRANCH
      uiBranch = css.ui === "DaisyUi" ? BRANCHES.TAILWINDDAISYBRANCH : css.ui === "FlowBite" ? BRANCHES.TAILWINDFLOWBITEBRANCH : null
      break;
    case "UnoCss":
      frameworkBranch = BRANCHES.UNOBRANCH
      uiBranch = css.ui === "DaisyUi" ? BRANCHES.UNODAISYBRANCH : null
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

const resolveConflictBothRecursive = async (schema, targetDir, frameworkBranch, err) => {
  targetDir = path.join(targetDir, schema?.appName)
  err.git.merges.forEach(element => {
    let currTargetPath = path.join(targetDir, element)

    let data = fs.readFileSync(currTargetPath, 'utf-8');
    let newValue = resolveConflict(null, data, frameworkBranch)
    fs.writeFileSync(currTargetPath, newValue, 'utf-8');
  });
}

const resolveConflictTheirsRecursive = async (schema, targetDir, frameworkBranch, err) => {
  targetDir = path.join(targetDir, schema?.appName)
  err.git.merges.forEach(element => {
    let currTargetPath = path.join(targetDir, element)

    let data = fs.readFileSync(currTargetPath, 'utf-8');
    let newValue = resolveConflict(1, data, frameworkBranch)
    fs.writeFileSync(currTargetPath, newValue, 'utf-8');
  });
}

const cloneRepo = async (targetDir, appName) => {

  const gitClone = simpleGit();
  await gitClone.clone("https://github.com/MahmoodKhalil57/neo-t3-sveltekit-scaffold.git", appName)
  const gitMerge = simpleGit({ baseDir: path.join(targetDir, appName) });

  await gitMerge.merge([BRANCHES.PWABRANCH])
  await gitMerge.merge([BRANCHES.BASEUIBRANCH])

  return gitMerge
}

const getApiBranch = (apiArray) => {
  let branch = `origin/${apiArray.join("") + BRANCHES.BASEUIINVBRANCH}`
  return branch
}

const mergeApi = async (schema, targetDir, gitMerge) => {
  const apiBranch = getApiBranch(schema?.apiArray)
  await gitMerge.merge(['--no-ff', apiBranch]).catch(async (err) => {
    await resolveConflictBothRecursive(schema, targetDir, apiBranch, err)
    await gitMerge.add("--all").commit(`Merge remote-tracking branch '${apiBranch}' into origin/Head`)
  })
}

const mergeCss = async (schema, targetDir, gitMerge) => {
  let [cssFrameworkBranch, cssUiFramworkBranch] = getCssBranch(schema?.css)

  if (cssFrameworkBranch) {
    if (!cssUiFramworkBranch) {
      if (cssFrameworkBranch === BRANCHES.UNOBRANCH) {
        await gitMerge.merge(['--no-ff', cssFrameworkBranch.replace("_", "+PWA_")]).catch(async (err) => {
          await resolveConflictBothRecursive(schema, targetDir, cssFrameworkBranch.replace("_", "+PWA_"), err)
          await gitMerge.add("--all").commit(`Merge remote-tracking branch '${cssFrameworkBranch.replace("_", "+PWA_")}' into origin/Head`)
        })
      }
      await gitMerge.merge(['--no-ff', cssFrameworkBranch.replace("_", "+BaseUI_")]).catch(async (err) => {
        await resolveConflictBothRecursive(schema, targetDir, cssFrameworkBranch.replace("_", "+BaseUI_"), err)
        await gitMerge.add("--all").commit(`Merge remote-tracking branch '${cssFrameworkBranch.replace("_", "+BaseUI_")}' into origin/Head`)
      })
    } else {
      if (cssUiFramworkBranch === BRANCHES.UNODAISYBRANCH) {
        await gitMerge.merge(['--no-ff', cssUiFramworkBranch.replace("_", "+PWA_")]).catch(async (err) => {
          await resolveConflictBothRecursive(schema, targetDir, cssUiFramworkBranch.replace("_", "+PWA_"), err)
          await gitMerge.add("--all").commit(`Merge remote-tracking branch '${cssUiFramworkBranch.replace("_", "+PWA_")}' into origin/Head`)

        })
      }
      await gitMerge.merge(['--no-ff', cssUiFramworkBranch.replace("_", "+BaseUI_")]).catch(async (err) => {
        cssUiFramworkBranch === BRANCHES.TAILWINDDAISYBRANCH ?
          await resolveConflictTheirsRecursive(schema, targetDir, cssUiFramworkBranch.replace("_", "+BaseUI_"), err) :
          await resolveConflictBothRecursive(schema, targetDir, cssUiFramworkBranch.replace("_", "+BaseUI_"), err)

        await gitMerge.add("--all").commit(`Merge remote-tracking branch '${cssUiFramworkBranch.replace("_", "+BaseUI_")}' into origin/Head`)
      })
    }
  }
}

const fixPackage = async (schema, targetDir) => {
  let devDependencies = {}
  let dependencies = {}

  devDependencies = { ...devDependencies, ...PACKAGEDATA.init.dev, ...PACKAGEDATA.PWA.dev };

  if (schema?.apiArray.length)
    for (let apiIndex in schema.apiArray) {
      switch (schema.apiArray[apiIndex]) {
        case "TRPC":
          devDependencies = { ...devDependencies, ...PACKAGEDATA.TRPC.dev };
          dependencies = { ...dependencies, ...PACKAGEDATA.TRPC.dep };
          break;
        case "Prisma":
          devDependencies = { ...devDependencies, ...PACKAGEDATA.Prisma.dev };
          dependencies = { ...dependencies, ...PACKAGEDATA.Prisma.dep };

          if (schema.apiArray.includes("AuthJs")) {
            devDependencies = { ...devDependencies, ...PACKAGEDATA.Prisma_AuthJs.dev };
          }
          break;
        case "AuthJs":
          dependencies = { ...dependencies, ...PACKAGEDATA.AuthJs.dep };
          break
        default:
          break
      }
    }

  if (schema?.css?.framework === "TailwindCss") {
    devDependencies = { ...devDependencies, ...PACKAGEDATA.TailwindCss.dev };
    if (schema?.css?.ui === "FlowBite") {
      devDependencies = { ...devDependencies, ...PACKAGEDATA.TailwindCss_FlowBite.dev };
    } else if (schema?.css?.ui === "DaisyUi") {
      dependencies = { ...dependencies, ...PACKAGEDATA.TailwindCss_DaisyUi.dep };
    }
  } else if (schema?.css.framework === "UnoCss") {
    devDependencies = { ...devDependencies, ...DEPENDENCIES.UnoCss.dev };
    if (schema?.css?.ui === "DaisyUi") {
      devDependencies = { ...devDependencies, ...DEPENDENCIES.UnoCss_DaisyUi.dev };
    }
  }


  let dataJson = PACKAGEDATA.package
  let dependenciesJson = { dependencies }
  let devDependenciesJson = { devDependencies }

  dataJson.name = schema.appName
  dataJson = { ...dataJson, devDependenciesJson }
  if (Object.keys(dependencies).length) {
    dataJson = { ...dataJson, dependenciesJson }
  }

  const targetPackagePath = path.join(targetDir, schema.appName, "/package.json")
  fs.writeFileSync(targetPackagePath, JSON.stringify(dataJson, null, 2), 'utf-8', 'w');
}

export default {
  cloneRepo,
  mergeApi,
  mergeCss,
  fixPackage
}