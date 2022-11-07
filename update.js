const fs = require('fs')
const path = require('path')
const isLocal = typeof process.pkg === 'undefined'
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath)
const { extension, defaultMetadata } = require(path.join(basePath, '/config.js'))
const buildDir = path.join(basePath, '/build/json')

const fileList = fs.readdirSync(buildDir)

fileList.forEach(file => {
  const index = file.split('.')[0]
  console.log(`Updating token #${index}`)
  const loadedFile = fs.readFileSync(`${buildDir}/${file}`)
  const data = JSON.parse(loadedFile)
  data.image = `${defaultMetadata.image}/${index}.${extension}`
  data.description = defaultMetadata.description
  fs.writeFileSync(`${buildDir}/${index}.json`, JSON.stringify(data))
})