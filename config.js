/*

  Install dependencies by running "npm install"

  Edit this configuration file as needed.

  Populate avax-engine/traits/ folder with trait assets.
  For example:
  /avax-engine/traits/Background/Trait_Name.png
  /avax-engine/traits/Base/Trait_Name.png
  ...

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

// Override traits for tokenID
const overrideTraits = [
  {
    id: 1,
    newTraits: [
      { trait_type: 'Background', value: 'Blueish' },
    ]
  },
  {
    id: 2,
    newTraits: [
      { trait_type: 'Background', value: 'Mint' },
    ]
  },
]

module.exports = {
  imageSize,
  extension,
  order,
  defaultMetadata,
  overrideTraits
}