import { simpleGit } from 'simple-git';
import path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process'


const gitInit = async (schema, dirs) => {
  const dirPath = path.join(dirs?.targetDir, schema?.appName, ".git")
  await fs.unlink(dirPath, (err => { }));

  // if(schema.gitInit)
  const git = await simpleGit(dirs?.targetDir);
  await git.init()
  await git.add("--all")
  await git.commit("init")
}

const addEnv = async (schema, dirs) => {
  let envContent = []

  if (schema?.apiArray?.includes("Prisma")) envContent.push("DATABASE_URL=" + schema?.env?.dataBaseUrl)
  if (schema?.apiArray?.includes("AuthJs")) envContent.push("GOOGLE_ID=" + schema?.env?.googleClientId)
  if (schema?.apiArray?.includes("AuthJs")) envContent.push("GOOGLE_SECRET=" + schema?.env?.googleClientSecret)

  const base64String = schema.env.authSecret !== "" ? schema.env.authSecret : crypto.randomBytes(32).toString('base64');
  if (schema?.apiArray?.includes("AuthJs")) envContent.push("AUTH_SECRET=" + base64String)


  await fs.appendFile(dirs?.targetPath, envContent.join('\n\r'), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}

const pnpmInit = async (schema) => {
  if (schema?.install) await exec(`cd ${schema?.appName} && pnpm i`)
}

const prismaDbPush = async (schema) => {
  if (schema?.dbPush) await exec(`cd ${schema?.appName} && pnpm prisma db push`)
}

export default {
  gitInit,
  addEnv,
  pnpmInit,
  prismaDbPush,
  // endScreen
}