/*

  Install dependencies by running "npm install"

  Edit this configuration file as needed.

  Populate /traits/ folder with trait assets.

  To begin generating run "npm run generate"
  Generated files will appear in /build/ folder.

  To update metadata run "npm run update"

*/

const defaultMetadata = {
  image: 'ipfs://ImageFolderCID',
  description: 'New collection description'
}

// image extension
const extension = 'png'

// Set image size below
const imageSize = {
  height: 1080,
  width: 1080
}

// Set up trait order below
const order = [
  { name: 'Background' },
  { name: 'Base' },
  { name: 'Skin' },
  { name: 'Clothes' },
  { name: 'Hat' },
  { name: 'Mouth' },
  { name: 'Eyes' },
]

// Contract address to fetch from
const contractAddress = '0x357928B721890Ed007142e45502A323827caF812'

module.exports = {
  imageSize,
  contractAddress,
  extension,
  order,
  defaultMetadata
}