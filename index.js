const fs = require('fs')
const path = require('path')
const isLocal = typeof process.pkg === 'undefined'
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath)

const { imageSize, extension, order, defaultMetadata, overrideTraits } = require(path.join(basePath, '/config.js'))
const data = require(path.join(basePath, '/ChadCollection.json'))

const { createCanvas, loadImage } = require(path.join(basePath,"/node_modules/canvas"))
const canvas = createCanvas(imageSize.width, imageSize.height)
const ctxMain = canvas.getContext('2d')
const clearCanvas = () => ctxMain.clearRect(0, 0, imageSize.width, imageSize.height)

const buildDir = path.join(basePath, '/build')
const buildSetup = () => {
  if (fs.existsSync(buildDir)) fs.rmSync(buildDir, { recursive: true })
  fs.mkdirSync(buildDir)
  fs.mkdirSync(path.join(buildDir, '/json'))
  fs.mkdirSync(path.join(buildDir, '/images'))
}

const saveMetadata = (_id, _data) => fs.writeFileSync(`${buildDir}/json/${_id}.json`, JSON.stringify(_data))

const saveImage = (_editionCount) => fs.writeFileSync(`${buildDir}/images/${_editionCount}.${extension === 'jpg' ? 'jpg' : 'png'}`,canvas.toBuffer(`${extension === 'jpg' ? 'image/jpeg' : 'image/png'}`))

const orderMetadata = (_order, _data) => {
  return _order.map(attr => _data.find(x => x.trait_type === attr.name))
}

const drawElement = (_renderObject, mainCanvas) => {
  const layerCanvas = createCanvas(imageSize.width, imageSize.height)
  const layerctx = layerCanvas.getContext('2d')

  layerctx.drawImage(_renderObject, 0, 0, imageSize.width, imageSize.height)
  mainCanvas.drawImage(layerCanvas, 0, 0, imageSize.width, imageSize.height)
}

async function* iterator(maxValue) {
  let i = 0
  while (i <= maxValue) {
    yield i++
  }
}

(async () => {
  try {
    buildSetup()
    for await (const i of iterator(data.length)) {
      clearCanvas()
      console.log(`Creating token #${i}`)
      if (data[i].attributes) {
        data[i].image = `${defaultMetadata.image}/${i}.${extension}`
        data[i].description = defaultMetadata.description
        if (overrideTraits.find(x => x.id === i)) {
          const override = overrideTraits.find(x => x.id === i).newTraits
          override.forEach(trait => {
            const index = data[i].attributes.findIndex((el) => el.trait_type === trait.trait_type)
            data[i].attributes[index].value = trait.value
          })
        }
        let orderedData = orderMetadata(order, data[i].attributes)
        for await (const indx of iterator(orderedData.length - 1)) {
          const image = await loadImage(`${basePath}/traits/${orderedData[indx].trait_type}/${orderedData[indx].value}.${extension}`)
  
          drawElement(image, ctxMain)
        }
        saveMetadata(i, data[i])
        saveImage(i)
      } else {
        console.log(`Token ${i} not revealed`)
      }
    }

    console.log(`Finished generating ${data.length} tokens.`)
  } catch (error) {
    console.log(error)
  }
})()