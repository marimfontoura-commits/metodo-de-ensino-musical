import { IMAGE_BLOCK_TYPE, type ImageBlockData } from './types'
import { createId } from '../../../services/idService'
import {
  DEFAULT_CONTENT_ALIGNMENT,
  DEFAULT_CONTENT_WIDTH,
} from '../../../models/layoutOptions'

export function createImageBlock(): ImageBlockData {
  return {
    id: createId('block'),
    type: IMAGE_BLOCK_TYPE,
    content: {
      url: 'https://picsum.photos/900/400',
      alt: 'Imagem ilustrativa',
    },
    settings: {
      rounded: false,
      width: DEFAULT_CONTENT_WIDTH,
      alignment: DEFAULT_CONTENT_ALIGNMENT,
    },
  }
}
