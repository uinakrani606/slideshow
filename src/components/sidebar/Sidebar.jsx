import "./sidebar.scss";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { ref, listAll } from "firebase/storage";
import { storage, db } from "../../firebase";

const Sidebar = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modelOpen, setModelOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null);
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setModelOpen(true); 
  };

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', modelOpen);
  },[modelOpen])

  const deleteTemplate = async (template) => {
    if (!selectedItem) return;
    const docRef = doc(db, "templates", template.id);

    deleteDoc(docRef)
      .then(() => {
        console.log("Entire Document has been deleted successfully.")
      })
      .catch(error => {
        console.log(error);
      })
    const storageRef = ref(storage, template.id);
    // Now we get the references of these files
    listAll(storageRef).then(function (result) {
      result.items.forEach(function (file) {
        file.delete();
      });
    }).catch(function (error) {
      // Handle any errors
    });
    setModelOpen(false); 
  }

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "templates"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setData(list);
      },
      (error) => {
        // console.log(error);
      }
    );

    return () => {
      unsub();
    };
  }, []);
  return (
    <>
      <div className="sidebar">
        <div className="top">
          <Link to="/" style={{ textDecoration: "none" }}>
            <span className="logo">SlideShow</span>
          </Link>
        </div>
        <hr />
        <div className="center flex flex-col gap-3">
          {/* New Template Button */}
          <Link to={'/template/create'} className="rounded-lg bg-emerald-400 w-full block px-2 py-2 text-center text-gray-800 hover:bg-emerald-500 transition-all duration-20">
            New Template
          </Link>
          <div className="search rounded-lg">
            <input type="text" className="px-3 text-sm py-2" onChange={handleSearchChange} placeholder="Search Template" />
          </div>
          <div>
            <ul>
              {data.map((item, index) => {
                if (!searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                  return (
                    <>
                      <li key={index} className="px-2 py-1 template-item bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 flex flex-col items-center justify-between mb-3">
                        <img src={item.thumbnail_url} alt="" className="w-full  object-cover border border-white rounded-md shadow-sm border mr-2" />
                        <div className="flex items-center justify-between w-full mt-2">
                          <Link to={item.id + '/view'} state={item} className="text-gray-800 text-semibold text-base w-full ">
                            {item.name}
                          </Link>
                          <div className="action-bar flex items-center">
                            <Link to={item.id+'/edit'} className="flex">
                            <span className="hover:bg-gray-300 p-1.5 rounded-lg transition-all duration-300">
                              <svg width="24" height="24" className="text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.2603 3.60022L5.05034 12.2902C4.74034 12.6202 4.44034 13.2702 4.38034 13.7202L4.01034 16.9602C3.88034 18.1302 4.72034 18.9302 5.88034 18.7302L9.10034 18.1802C9.55034 18.1002 10.1803 17.7702 10.4903 17.4302L18.7003 8.74022C20.1203 7.24022 20.7603 5.53022 18.5503 3.44022C16.3503 1.37022 14.6803 2.10022 13.2603 3.60022Z" stroke="currentColor" stroke-width="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11.8896 5.0498C12.3196 7.8098 14.5596 9.9198 17.3396 10.1998" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3 22H21" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                            </Link>
                            <span onClick={() => handleDeleteClick(item)} className="hover:bg-gray-300 p-1.5 rounded-lg transition-all duration-300">
                              <svg width="22" height="22" className="text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 5.98047C17.67 5.65047 14.32 5.48047 10.98 5.48047C9 5.48047 7.02 5.58047 5.04 5.78047L3 5.98047" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M18.8504 9.13965L18.2004 19.2096C18.0904 20.7796 18.0004 21.9996 15.2104 21.9996H8.79039C6.00039 21.9996 5.91039 20.7796 5.80039 19.2096L5.15039 9.13965" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10.3301 16.5H13.6601" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9.5 12.5H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </li>
                    </>
                  );
                } else {
                  return null;
                }
              })}
            </ul>
          </div>
        </div>
      </div>
      {modelOpen && (
        <>        
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-55 z-[99]">
            <div className="max-w-[350px] w-full">

          <div className="delete-popup absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 rounded-md max-w-[350px] w-full">
            <div>
              <p className="text-lg">Are you sure you want to delete  
              <span className="text-red-500 font-semibold"> {selectedItem.name}</span> template?</p>
            </div>
            <div className="w-full flex justify-end gap-3.5 items-center mt-5" >

            <button onClick={() => setModelOpen(false)} className="bg-gray-200 hover:bg-gray-300 transition-all duration-300 py-2 px-3.5 rounded-md max-w-24 w-full">No</button>
            <button onClick={() => deleteTemplate(selectedItem)} className="bg-red-500 transitino-all duration-300 hover:bg-emerald-600 py-2 px-3.5 rounded-md max-w-24 w-full text-white">Yes</button>
            </div>
            </div>
          </div>
          </div>
        </>
      )
      }
    </>
  );
};

export default Sidebar;
