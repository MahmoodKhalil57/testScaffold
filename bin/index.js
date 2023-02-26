#! /usr/bin/env node
import cli from '../src/main/cli.js'
import path from 'path'
import url from 'url'

const main = async () => {
  const schema = await cli.getSchema()

  if (schema) {
    const dirs = {}
    const projectIndexDir = url.fileURLToPath(import.meta.url)
    dirs.packageDir = path.resolve(projectIndexDir, '../../')
    dirs.targetDir = process.cwd()
    await cli.createProject(schema, dirs)
  }
}

main()