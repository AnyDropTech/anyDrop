import { DeleteIcon } from '../../components'
import { getFileTypeIcon } from '../../utils'

import './fileList.scss'

export interface IFileItem {
  name: string
  size: string
  ext: string
  path: string
}
export interface IProps {
  fileList: IFileItem[]
  handleRemoveItem: (index: number) => void
}

function FileItem(props: {
  name: string
  size: string
  ext: string
  index: number
  handleRemoveItem: (index: number) => void
}) {
  const FileIcon = () => getFileTypeIcon(props.ext)
  return (
    <div className="file-item">
      <div className="file-icon"><FileIcon /></div>
      <div className="file-name">{props.name}</div>
      <div className="file-size">{props.size}</div>
      <div className="file-delete" onClick={() => props.handleRemoveItem(props.index)}>
        <DeleteIcon />
      </div>
    </div>
  )
}

export function FileList(props: IProps) {
  const { fileList, handleRemoveItem } = props
  return (
    <div className="file-list">
      {
        fileList.map((item, index) => <FileItem {...item} index={index} key={`file-item${index}`} handleRemoveItem={handleRemoveItem}/>)
      }
    </div>
  )
}
