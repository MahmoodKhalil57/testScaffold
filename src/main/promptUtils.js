import chalk from 'chalk'
import inquirer from 'inquirer'
import crypto from "node:crypto"

async function initPrompts() {
  const { appName } = await inquirer.prompt({
    name: "appName",
    type: "input",
    message: "What is the name of your app? (enter . to create in current dir)",
    default() {
      return "t3Sveltekit"
    }
  })

  const { isCustom } = await inquirer.prompt({
    name: "isCustom",
    type: "list",
    message: "Would you like to customise the project?",
    choices: [
      "Express Install",
      "Custom Install"
    ]
  })

  return {
    appName,
    isCustom: isCustom === "Custom Install"
  }
}

async function customPrompts() {
  let isStupid = false
  let apiArray = ["Trpc", "Prisma", "Auth.js"]
  let cssFramework = "None"
  let uiFramwork = "None"

  const { is } = await inquirer.prompt({
    name: "isStupid",
    type: "list",
    message: "Javascript or Typescript?",
    choices: [
      "Javascript",
      "Typescript"
    ]
  })
  if (is === "Javascript") {
    console.log("I think you meant typescript so Ill go with that")
    isStupid = true
  }

  // get api array

  const { aa } = await inquirer.prompt({
    name: "aa",
    type: "checkbox",
    message: "Select libraries you wish to include",
    choices: [
      "Trpc",
      "Prisma",
      "Auth.js"
    ]
  })
  apiArray = aa

  // get css obj
  const { cf } = await inquirer.prompt({
    name: "cf",
    type: "list",
    message: "Which css framework would you like to include",
    choices: [
      "TailwindCss",
      "UnoCss",
      "None"
    ]
  })
  cssFramework = cf

  if (cf === "TwailwindCss") {
    const { uf } = await inquirer.prompt({
      name: "uf",
      type: "list",
      message: "Which css framework would you like to include",
      choices: [
        "DaisyUi",
        "FlowBite",
        "None"
      ]
    })
    uiFramwork = uf
  }
  else if (cf === "UnoCss") {
    const { uf } = await inquirer.prompt({
      name: "uf",
      type: "list",
      message: "Which css framework would you like to include",
      choices: [
        "DaisyUi",
        "Onu (beta)",
        "None"
      ]
    })
    uiFramwork = uf
  }

  return {
    isStupid,
    apiArray,
    cssFramework,
    uiFramwork
  }
}

async function expressPrompts() {
  let isStupid = false
  let apiArray = ["Trpc", "Prisma", "Auth.js"]
  let cssFramework = "None"
  let uiFramwork = "None"

  const { ea } = await inquirer.prompt({
    name: "ea",
    type: "list",
    message: "What kind of project do you want?",
    choices: [
      "Full stack (Frontend + Backend + Database)",
      "Frontend + Backend",
      "Frontend only"
    ]
  })
  switch (ea) {
    case ("Full stack (Frontend + Backend + Database)"):
      apiArray = ["Trpc", "Prisma", "Auth.js"]
      break;
    case ("Frontend + Backend"):
      apiArray = ["Trpc"]
      break;
    case ("Frontend only"):
      apiArray = []
      break;
    default:
      break;
  }

  const { ca } = await inquirer.prompt({
    name: "ca",
    type: "list",
    message: "Would you like to include a css framework?",
    choices: [
      "TailwindCss",
      "TailwindCss + FlowBite",
      "None"
    ]
  })
  if (ca === "TailwindCss") {
    cssFramework = "TailwindCss"
  } else if (ca === "TailwindCss + FlowBite") {
    cssFramework = "TailwindCss"
    uiFramwork = "FlowBite"
  }


  return {
    isStupid,
    apiArray,
    cssFramework,
    uiFramwork
  }
}

async function finalPrompts(hasDb) {

  let googleClientId = ''
  let googleClientSecret = ''
  let dataBaseUrl = 'file:./sqlite.db'
  let authSecret = ''
  let install = false
  let dbPush = false

  const { setEnv } = await inquirer.prompt({
    name: "setEnv",
    type: "list",
    message: "Enter env vars with cli?",
    choices: [
      "No",
      "Yes"
    ]
  })

  if (setEnv === "Yes") {
    const { gci } = await inquirer.prompt(
      {
        name: "gci",
        type: "input",
        message: "Enter GoogleOauth2 clientId:",
        default() {
          return "Leave empty to manually set later"
        }
      }
    );

    const { gcs } = await inquirer.prompt(
      {
        name: "gcs",
        type: "input",
        message: "Enter GoogleOauth2 clientSecret:",
        default() {
          return "Leave empty to manually set later"
        }
      }
    );

    const { dbu } = await inquirer.prompt(
      {
        name: "dbu",
        type: "input",
        message: "Enter dataBase Url:",
        default() {
          return "Leave empty to create local db"
        }
      }
    );

    const { as } = await inquirer.prompt(
      {
        name: "as",
        type: "input",
        message: "Enter authSecret:",
        default() {
          return "Leave empty to auto generate"
        }
      }
    );

    (gci !== "Leave empty to manually set later") && (googleClientId = gci);
    (gcs !== "Leave empty to manually set later") && (googleClientSecret = gcs);
    (dbu !== "Leave empty to create local db") && (dataBaseUrl = dbu);
    (as !== "Leave empty to auto generate") && (authSecret = as);

  } else {
    //TODO set env manually warning
  }

  if (authSecret === "") {
    const buffer = crypto.randomBytes(32);
    const base64String = buffer.toString('base64');
    authSecret = base64String
  }

  const { inst } = await inquirer.prompt({
    name: "inst",
    type: "list",
    message: "Should we run pnpm install for you?",
    choices: [
      "Yes",
      "No"
    ]
  })
  install = inst === "Yes"

  if (hasDb) {
    const { dp } = await inquirer.prompt({
      name: "dp",
      type: "list",
      message: "Should we run pnpm db push for you?",
      choices: [
        "Yes",
        "No"
      ]
    })
    dbPush = dp === "Yes"

  }

  return {

    googleClientId,
    googleClientSecret,
    dataBaseUrl,
    authSecret,
    install,
    dbPush
  }
}

export default {
  initPrompts,
  customPrompts,
  expressPrompts,
  finalPrompts
}