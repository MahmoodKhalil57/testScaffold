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
  const reg = new RegExp(`<<<<<<< HEAD|=======|>>>>>>>\\s${frameworkBranch}`, 'gm')
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

const mergeApi = async (apiArray, gitMerge) => {
  //TODO
  return gitMerge
}

const mergeCss = async (dirs, css, gitMerge) => {
  let [cssFrameworkBranch, cssUiFramworkBranch] = getCssBranch(css)

  if (cssFrameworkBranch) {
    let baseUICssFrameworkBranch = null
    if (cssFrameworkBranch === UNOBRANCH) {
      baseUICssFrameworkBranch = cssFrameworkBranch.replace("_", "+PWA_")
    }
    await gitMerge.merge(['--no-ff', baseUICssFrameworkBranch ?? cssFrameworkBranch]).catch(async (err) => {
      await resolveConflictBothRecursive(dirs.targetDir, baseUICssFrameworkBranch ?? cssFrameworkBranch, err)
      await gitMerge.add("--all").commit(`Merge remote-tracking branch '${baseUICssFrameworkBranch ?? cssFrameworkBranch}' into origin/Head`)
    })
    if (!cssUiFramworkBranch) {
      await gitMerge.merge(['--no-ff', cssFrameworkBranch.replace("_", "+BaseUI_")]).catch(async (err) => {
        await resolveConflictBothRecursive(dirs.targetDir, cssFrameworkBranch.replace("_", "+BaseUI_"), err)
        await gitMerge.add("--all").commit(`Merge remote-tracking branch '${cssFrameworkBranch.replace("_", "+BaseUI_")}' into origin/Head`)
      })
    } else {
      let baseUIcssUiFramworkBranch = null
      if (cssUiFramworkBranch === UNODAISYBRANCH) {
        baseUIcssUiFramworkBranch = cssUiFramworkBranch.replace("_", "+PWA_")
      }
      await gitMerge.merge(['--no-ff', baseUIcssUiFramworkBranch ?? cssUiFramworkBranch]).catch(async (err) => {
        baseUIcssUiFramworkBranch ?? cssUiFramworkBranch === TAILWINDDAISYBRANCH ?
          await resolveConflictTheirsRecursive(dirs.targetDir, baseUIcssUiFramworkBranch ?? cssUiFramworkBranch, err) :
          await resolveConflictBothRecursive(dirs.targetDir, baseUIcssUiFramworkBranch ?? cssUiFramworkBranch, err)

        await gitMerge.add("--all").commit(`Merge remote-tracking branch '${baseUIcssUiFramworkBranch ?? cssUiFramworkBranch}' into origin/Head`)
      })
      await gitMerge.merge(['--no-ff', cssUiFramworkBranch.replace("_", "+BaseUI_")]).catch(async (err) => {
      })
    }
  }

  return gitMerge
}

export default {
  cloneRepo,
  mergeApi,
  mergeCss
}