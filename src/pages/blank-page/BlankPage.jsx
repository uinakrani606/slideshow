import React from 'react'
import "../list/list.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import ImageAnnotator from '../image-annotator/image-annotator'
const BlankPage = () => {
  return (
    <div>
          <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <ImageAnnotator/>
      </div>
    </div>
    </div>
  )
}

export default BlankPage
