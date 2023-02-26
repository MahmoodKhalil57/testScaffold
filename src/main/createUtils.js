import { simpleGit } from 'simple-git';
import path from 'path';
import * as fs from 'fs';

const cloneRepo = async (targetDir) => {

  const gitClone = simpleGit();
  await gitClone.clone("https://github.com/MahmoodKhalil57/neo-t3-sveltekit-scaffold.git")
  const gitMerge = simpleGit({ baseDir: path.join(targetDir, 'neo-t3-sveltekit-scaffold') });

  await gitMerge.merge(['origin/PWA_V1.1.0'])
  await gitMerge.merge(['origin/BaseUI_V1.1.0'])

  return gitMerge
}

const getCssBranch = (css) => {
  let frameworkBranch = null
  let uiBranch = null
  switch (css.framework) {
    case "TailwindCss":
      frameworkBranch = 'origin/Tailwind_V1.1.0'
      uiBranch = css.ui === "DaisyUi" ? 'origin/TailwindDaisy_V1.1.0' : css.ui === "Flowbite" ? 'origin/TailwindFlowbite_V1.1.0' : null
      break;
    case "UnoCss":
      frameworkBranch = 'origin/Unocss_1.0.1'
      uiBranch = css.ui === "DaisyUi" ? 'origin/UnoDaisy_V1.1.0' : css.ui === "Onu (beta)" ? 'origin/UnoOno_V1.1.0' : null
      break;
    default:
      break;
  }
  return [frameworkBranch, uiBranch]
}

const mergeApi = async (apiArray, gitMerge) => {
  //TODO
  return gitMerge
}

const resolveConflictBoth = async (targetDir, frameworkBranch, err) => {
  targetDir = path.join(targetDir, "/neo-t3-sveltekit-scaffold/")
  err.git.merges.forEach(element => {
    let currTargetPath = path.join(targetDir, element)

    let data = fs.readFileSync(currTargetPath, 'utf-8');
    const reg = new RegExp(`\\r\\n<<<<<<< HEAD|<<<<<<< HEAD|\\r\\n=======|\\r\\n>>>>>>>\\s${frameworkBranch}`, 'gm')
    let newValue = data.replace(reg, '');
    fs.writeFileSync(currTargetPath, newValue, 'utf-8');
  });
}

const mergeCss = async (dirs, css, gitMerge) => {
  let [cssFrameworkBranch, cssUiFramworkBranch] = getCssBranch(css)

  if (cssFrameworkBranch) {
    await gitMerge.merge(['--no-ff', cssFrameworkBranch]).catch(async (err) => {
      await resolveConflictBoth(dirs.targetDir, cssFrameworkBranch, err)
      await gitMerge.add("--all").commit(`Merge remote-tracking branch '${cssFrameworkBranch}' into origin/Head`)
    })

    if (cssUiFramworkBranch) {
      await gitMerge.merge(['--no-ff', cssUiFramworkBranch]).catch(async (err) => {
        await resolveConflictBoth(dirs.targetDir, cssUiFramworkBranch, err)
        await gitMerge.add("--all").commit(`Merge remote-tracking branch '${cssUiFramworkBranch}' into origin/Head`)
      })
      await gitMerge.merge(['--no-ff', cssUiFramworkBranch.replace("_", "+BaseUI_")]).catch(async (err) => {
        await resolveConflictBoth(dirs.targetDir, cssUiFramworkBranch.replace("_", "+BaseUI_"), err)
        await gitMerge.add("--all").commit(`Merge remote-tracking branch '${cssUiFramworkBranch.replace("_", "+BaseUI_")}' into origin/Head`)
      })
    } else {
      await gitMerge.merge(['--no-ff', cssFrameworkBranch.replace("_", "+BaseUI_")]).catch(async (err) => {
        await resolveConflictBoth(dirs.targetDir, cssFrameworkBranch.replace("_", "+BaseUI_"), err)
        await gitMerge.add("--all").commit(`Merge remote-tracking branch '${cssFrameworkBranch.replace("_", "+BaseUI_")}' into origin/Head`)
      })
    }
  }

  return gitMerge
}

const initCreate = async (schema, dirs) => {
  console.log("Schema: ", schema)
  console.log("dirs", dirs)

  let gitMerge = await cloneRepo(dirs?.targetDir)

  gitMerge = await mergeApi(schema.apiArray, gitMerge)

  gitMerge = await mergeCss(dirs, schema?.css, gitMerge)

  //Todo end stuff
}


export default {
  initCreate
}