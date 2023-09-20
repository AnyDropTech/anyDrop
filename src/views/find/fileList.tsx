import { getFileTypeIcon } from '../../utils'

import './fileList.scss'

export interface IFileItem {
  name: string
  size: string
}
export interface IProps {
  fileList: IFileItem[]
}

function FileItem(props: IFileItem) {
  const FileIcon = () => getFileTypeIcon(props.name)
  return (
    <div className="file-item">
      <div className="file-icon"><FileIcon /></div>
      <div className="file-name">{props.name}</div>
      <div className="file-size">{props.size}</div>
    </div>
  )
}

export function FileList(props: IProps) {
  const { fileList } = props
  return (
    <div className="file-list">
      {
        fileList.map(item => <FileItem {...item} />)
      }
    </div>
  )
}
