import promptUtils from './promptUtils.js'
import createUtils from './createUtils.js'


const cli = {
  getSchema: async () => {
    // init
    let schema = {
      appName: "t3Sveltekit",
      apiArray: ["Trpc", "Prisma", "Auth.js"],
      css: {
        framework: "None",
        ui: "None"
      },
      env: {
        googleClientId: "",
        googleClientSecret: "",
        authSecret: "",
        dataBaseUrl: "file:./sqlite.db"
      },
      install: false,
      dbPush: false,
      isStupid: false
    }
    let { appName, isCustom } = await promptUtils.initPrompts()
    schema.appName = appName

    if (isCustom) {
      let { isStupid, apiArray, cssFramework, uiFramwork } = await promptUtils.customPrompts()
      schema.isStupid = isStupid
      schema.apiArray = apiArray
      schema.css.framework = cssFramework
      schema.css.ui = uiFramwork
    }
    else {
      let { isStupid, apiArray, cssFramework, uiFramwork } = await promptUtils.expressPrompts()
      schema.isStupid = isStupid
      schema.apiArray = apiArray
      schema.css.framework = cssFramework
      schema.css.ui = uiFramwork
    }

    const hasDb = schema.apiArray.some(val => val === "Prisma")
    let { googleClientId, googleClientSecret, dataBaseUrl,
      authSecret, install, dbPush } = await promptUtils.finalPrompts(hasDb)
    schema.env.googleClientId = googleClientId
    schema.env.googleClientSecret = googleClientSecret
    schema.env.dataBaseUrl = dataBaseUrl
    schema.env.authSecret = authSecret
    schema.install = install
    schema.dbPush = dbPush


    return schema
  },
  createProject: async (schema, dirs) => {
    createUtils.initCreate(schema, dirs)
  }
}

export default cli


