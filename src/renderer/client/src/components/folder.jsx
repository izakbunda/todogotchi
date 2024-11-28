import React, { useState, useEffect, useRef } from 'react'
import PropTypes, { bool } from 'prop-types'
import '../css/folder.css'
import '../css/index.css'

import folder_icon from '../assets/folder_icon.svg'

function Folder({
  name,
  id,
  notesNumber,
  onClick,
  onUpdateFolderName,
  className,
  editing,
  endEditing
}) {
  const [clickedOnce, setClickedOnce] = useState(false)
  const [folderName, setFolderName] = useState(name)
  const folderRef = useRef(null)

  const handleClick = () => {
    if (!clickedOnce) {
      setClickedOnce(true)
    } else {
      if (onClick && !editing) {
        onClick()
      }
      console.log('Second click action!')
    }
  }

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      onUpdateFolderName(id, folderName)
      endEditing()
    }
  }

  // const handleBlur = async () => {
  //     setIsEditing(false);
  //     if (folderName.trim() && folderName !== name) {
  //         console.log("call parent handler");
  //         await onUpdateFolderName(id, folderName); // Call parent handler
  //     } else {
  //         setFolderName(name); // Revert to original name if no change
  //     }
  // }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (folderRef.current && !folderRef.current.contains(event.target)) {
        setClickedOnce(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [])

  return (
    <div
      ref={folderRef}
      id={id}
      className={['folder-container', clickedOnce && 'clicked'].filter(Boolean).join(' ')}
      onClick={handleClick}
    >
      <div className="left-half" id={id}>
        <img src={folder_icon} className="folder-icon" id={id} />
        {editing ? (
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={handleEnter}
            autoFocus
            className="folder-input"
          />
        ) : (
          <h4 id={id}>{folderName}</h4>
        )}
      </div>
      {className === 'folder-page-folder' && (
        <div className="right-half" id={id}>
          <p className="notes-number" id={id}>
            {notesNumber}
          </p>
        </div>
      )}
    </div>
  )
}

export default Folder