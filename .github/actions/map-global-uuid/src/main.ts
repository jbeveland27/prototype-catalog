import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import * as path from 'path'
import fs from 'fs'

async function run() {
  try {
    // const inputPath: string = core.getInput("path", { required: true });
    // const files = core.getInput("files");
    // const fileList = files.split(/,\s+/);

    const wd: string = process.env[`GITHUB_WORKSPACE`] || ''
    const submoduleName: string = core.getInput('submodule-name', {
      required: true
    })
    const submodulePath: string = path.join(wd, submoduleName)

    const globalsJsonPath: string = path.join(wd, 'globals.json')
    const globalsJson = require(globalsJsonPath)

    if (globalsJson.hasOwnProperty(submoduleName)) {
      // Update nr1.json with globalsJson.submoduleName
      const uuid = globalsJson.submoduleName

      const nr1JsonPath: string = path.join(submodulePath, 'nr1.json')
      const content = fs.readFileSync(nr1JsonPath, 'utf8')
      const data = JSON.parse(content)
      console.debug('nr1Json: ', data)

      data.id = uuid

      fs.writeFile(nr1JsonPath, JSON.stringify(data, null, 2), function writeJSON(err) {
        if (err) return console.log(err)
        console.debug('nr1Json after writing uuid: ', JSON.stringify(data, null, 2))
        console.debug(`Writing to: ${nr1JsonPath}`)
      })
    } else {
      // run: |
      //   cd submoduleName
      //   nr1 nerdpack:uuid -gf
      core.debug(`Generating new uuid for submodule: ${submoduleName}`)
      // const nr1 = await io.which('nr1', true)
      // await exec.exec(`"${nr1}" nerdpack:uuid -gf`, [], {cwd: submodulePath})

      const {exec} = require('child_process')
      exec(`cd ${submodulePath} ; nr1 nerdpack:uuid -gf`, (err: any, stdout: any, stderr: any) => {
        if (err) {
          //some err occurred
          console.error(err)
        } else {
          // the *entire* stdout and stderr (buffered)
          console.log(`stdout: ${stdout}`)
          console.log(`stderr: ${stderr}`)

          // Get generated uuid from nr1.json
          const nr1JsonPath: string = path.join(submodulePath, 'nr1.json')
          const nr1Json = require(nr1JsonPath)
          console.debug('nr1Json after generation: ', nr1Json)
          console.debug('globalsJson: ', globalsJson)

          // Copy uuid out of nr1.json into globals.json
          const uuid = nr1Json.hasOwnProperty('id') ? nr1Json.id : ''
          globalsJson.submoduleName = uuid
          fs.writeFile(globalsJsonPath, JSON.stringify(globalsJson, null, 2), function writeJSON(
            err
          ) {
            if (err) return console.log(err)
            console.debug('globals after writing uuid: ', JSON.stringify(globalsJson, null, 2))
            console.debug(`Writing to: ${globalsJsonPath}`)
          })
        }
      })
      // TODO: Commit globals.json (in PR?)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
