import * as core from '@actions/core'
import * as exec from '@actions/exec'
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
      console.debug(`Generating new uuid for submodule: ${submoduleName}`)
      console.debug(`Path: ${submodulePath}`)
      // const nr1 = await io.which('nr1', true)
      // const options: {[key: string]: string} = {}
      // options.cwd = submodulePath
      await exec.exec(`nr1 nerdpack:uuid -gf`, [], {cwd: submodulePath})

      // Get generated uuid from nr1.json
      const nr1JsonPath: string = path.join(submodulePath, 'nr1.json')
      const nr1Json = require(nr1JsonPath)
      console.debug('nr1Json after generation: ', nr1Json)
      console.debug('globalsJson: ', globalsJson)

      // Copy uuid out of nr1.json into globals.json
      const uuid = nr1Json.hasOwnProperty('id') ? nr1Json.id : ''
      globalsJson.submoduleName = uuid
      fs.writeFile(globalsJsonPath, JSON.stringify(globalsJson, null, 2), function writeJSON(err) {
        if (err) return console.log(err)
        console.debug('globals after writing uuid: ', JSON.stringify(globalsJson, null, 2))
        console.debug(`Writing to: ${globalsJsonPath}`)
      })

      // TODO: Commit globals.json (in PR?)

      // const {exec, execFile} = require('child_process')
      // exec('ls -la /usr/bin/nr1', (err: any, stdout: any, stderr: any) => {
      //   if (err) {
      //     console.error(`1st exec error: ${err}`)
      //   }
      //   console.log(`stdout: ${stdout}`)
      //   console.log(`stderr: ${stderr}`)
      // })

      // exec(`ls -la ${submodulePath}`, (err: any, stdout: any, stderr: any) => {
      //   if (err) {
      //     console.error(`1st exec error: ${err}`)
      //   }
      //   console.log(`stdout: ${stdout}`)
      //   console.log(`stderr: ${stderr}`)
      // })

      // execFile('cd', [`'${submodulePath}'`], (err: any, stdout: any, stderr: any) => {
      //   if (err) {
      //     //some err occurred
      //     console.error(`exec error: ${err}`)
      //     core.setFailed(`map-global-uuid failed: ${err.message}`)
      //   } else {
      //     execFile('/usr/bin/nr1', ['nerdpack:info'], (err: any, stdout: any, stderr: any) => {
      //       if (err) {
      //         //some err occurred
      //         console.error(`exec error: ${err}`)
      //         core.setFailed(`map-global-uuid failed: ${err.message}`)
      //       } else {
      //         // the *entire* stdout and stderr (buffered)
      //         console.log(`stdout: ${stdout}`)
      //         console.log(`stderr: ${stderr}`)

      //         // Get generated uuid from nr1.json
      //         const nr1JsonPath: string = path.join(submodulePath, 'nr1.json')
      //         const nr1Json = require(nr1JsonPath)
      //         console.debug('nr1Json after generation: ', nr1Json)
      //         console.debug('globalsJson: ', globalsJson)

      //         // Copy uuid out of nr1.json into globals.json
      //         const uuid = nr1Json.hasOwnProperty('id') ? nr1Json.id : ''
      //         globalsJson.submoduleName = uuid
      //         fs.writeFile(
      //           globalsJsonPath,
      //           JSON.stringify(globalsJson, null, 2),
      //           function writeJSON(err) {
      //             if (err) return console.log(err)
      //             console.debug(
      //               'globals after writing uuid: ',
      //               JSON.stringify(globalsJson, null, 2)
      //             )
      //             console.debug(`Writing to: ${globalsJsonPath}`)
      //           }
      //         )
      //       }
      //     })
      //   }
      // })

      // const {exec, spawn} = require('child_process')

      // const pwd = spawn('pwd', [], {cwd: submodulePath})
      // pwd.stdout.on('data', (data: any) => {
      //   console.log(`stdout: ${data}`)
      // })

      // pwd.stderr.on('data', (data: any) => {
      //   console.log(`stderr: ${data}`)
      // })

      // pwd.on('close', (code: any) => {
      //   console.log(`child process exited with code ${code}`)
      // })

      // const ls = spawn('ls -la /usr/bin/nr1', [], {cwd: submodulePath})
      // ls.stdout.on('data', (data: any) => {
      //   console.log(`ls stdout: ${data}`)
      // })

      // ls.stderr.on('data', (data: any) => {
      //   console.log(`ls stderr: ${data}`)
      // })

      // ls.on('close', (code: any) => {
      //   console.log(`ls child process exited with code ${code}`)
      // })

      // exec(
      //   'pwd',
      //   {cwd: '/home/runner/work/prototype-catalog/prototype-catalog/prototype-nr1-actions'},
      //   (err: any, stdout: any, stderr: any) => {
      //     if (err) {
      //       console.error(`1st exec error: ${err}`)
      //     }
      //   }
      // )

      // exec(
      //   'ls -la /usr/bin/nr1',
      //   {cwd: '/home/runner/work/prototype-catalog/prototype-catalog/prototype-nr1-actions'},
      //   (err: any, stdout: any, stderr: any) => {
      //     if (err) {
      //       console.error(`1st exec error: ${err}`)
      //     }
      //   }
      // )

      // exec('/usr/bin/nr1', (err: any, stdout: any, stderr: any) => {
      //   if (err) {
      //     //some err occurred
      //     console.error(`exec error: ${err}`)
      //     core.setFailed(`map-global-uuid failed: ${err.message}`)
      //   } else {
      //     // the *entire* stdout and stderr (buffered)
      //     console.log(`stdout: ${stdout}`)
      //     console.log(`stderr: ${stderr}`)

      //     // Get generated uuid from nr1.json
      //     const nr1JsonPath: string = path.join(submodulePath, 'nr1.json')
      //     const nr1Json = require(nr1JsonPath)
      //     console.debug('nr1Json after generation: ', nr1Json)
      //     console.debug('globalsJson: ', globalsJson)

      //     // Copy uuid out of nr1.json into globals.json
      //     const uuid = nr1Json.hasOwnProperty('id') ? nr1Json.id : ''
      //     globalsJson.submoduleName = uuid
      //     fs.writeFile(globalsJsonPath, JSON.stringify(globalsJson, null, 2), function writeJSON(
      //       err
      //     ) {
      //       if (err) return console.log(err)
      //       console.debug('globals after writing uuid: ', JSON.stringify(globalsJson, null, 2))
      //       console.debug(`Writing to: ${globalsJsonPath}`)
      //     })
      //   }
      // })
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
