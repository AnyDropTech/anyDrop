import { DirectoryIcon, MusicIcon, PdfIcon, PictureIcon, PptIcon, RarIcon, SheetIcon, TxtIcon, UnkownIcon, VideoIcon, WordIcon } from '../components/icons/files'

const iconMap: Record<string, string[]> = {
  folder: ['folder'],
  music: ['mp3'],
  video: ['mp4', 'avi', 'rmvb', 'rm', 'mkv', 'wmv', 'flv', '3gp', 'mov'],
  picture: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  word: ['doc', 'docx'],
  sheet: ['xls', 'xlsx'],
  ppt: ['ppt', 'pptx'],
  pdf: ['pdf'],
  txt: ['txt'],
  rar: ['rar', 'zip', '7z', 'tar', 'gz', 'bz2', 'xz', 'z'],
}

function getFileTypeIcon(fileExt: string) {
  let iconType = 'unkown'
  for (const k in iconMap) {
    if (iconMap[k].includes(fileExt)) {
      iconType = k
      break
    }
  }

  switch (iconType) {
    case 'folder':
      return <DirectoryIcon />
    case 'music':
      return <MusicIcon />
    case 'video':
      return <VideoIcon />
    case 'picture':
      return <PictureIcon />
    case 'word':
      return <WordIcon />
    case 'sheet':
      return <SheetIcon />
    case 'ppt':
      return <PptIcon />
    case 'pdf':
      return <PdfIcon />
    case 'txt':
      return <TxtIcon />
    case 'rar':
      return <RarIcon />
    default:
      return <UnkownIcon />
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

export { formatFileSize, getFileTypeIcon }
