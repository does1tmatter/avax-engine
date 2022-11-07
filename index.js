const { ethers } = require('ethers')
const avaxProvider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc')
const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const isLocal = typeof process.pkg === 'undefined'
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath)

const { imageSize, contractAddress, extension, order, defaultMetadata } = require(path.join(basePath, '/config.js'))
const abi = require(path.join(basePath, '/abi.json'))

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

const saveImage = (_id) => {
  const out = fs.createWriteStream(`${buildDir}/images/${_id}.${extension}`)
  const stream = canvas.createPNGStream()
  stream.pipe(out)
  out.on('finish', () =>  console.log(`Token #${_id} created`))
}

const saveMetadata = (_id, _data) => fs.writeFileSync(`${buildDir}/json/${_id}.json`, JSON.stringify(_data))

const fixURL = (url) => url.startsWith("ipfs") ? `https://ipfs.io/ipfs/${url.split("ipfs://")[1]}` : url

const contract = new ethers.Contract(contractAddress, abi, avaxProvider)

const getTokenURI = async (_id) => await contract.tokenURI(_id).then(res => fixURL(res))
const getSupply = async () => await contract.totalSupply().then(res => Number(res))


const getMetadata = async (id) => {
  return fetch(await getTokenURI(id)).then(res => res.json())
}

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
  let i = 1
  while (i <= maxValue) {
    yield i++
  }
}

(async () => {
  buildSetup()
  const supply = await getSupply()
  console.log(`Total supply: ${supply}`)
  for await (const i of iterator(supply)) {
    clearCanvas()
    console.log(`Creating token #${i}`)
    const data = await getMetadata(i)
    data.image = `${defaultMetadata.image}/${i}.${extension}`
    data.description = defaultMetadata.description
    const orderedData = orderMetadata(order, data.attributes)
    orderedData.forEach(async (attribute) => {
      const image = await loadImage(`${basePath}/traits/${attribute.trait_type}/${attribute.value}.${extension}`)

      drawElement(image, ctxMain)
    })
    saveImage(i)
    saveMetadata(i, data)
  }
  console.log(`Finished generating ${supply} tokens.`)
})()