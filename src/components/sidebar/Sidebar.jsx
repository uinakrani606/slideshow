import "./sidebar.scss";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, onSnapshot  } from "firebase/firestore";
import { db } from "../../firebase";

const Sidebar = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  useEffect(() => {
      const unsub = onSnapshot(
      collection(db, "templates"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data()});
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
                  <li key={index} className="template-item">
                    <Link to={'/image-annotator/'+item.id} state={item} className="text-gray-800 p-2 bg-gray-100 rounded-lg text-semibold mb-3 text-base w-full hover:bg-gray-200 transition-all duration-200">
                      {item.name}
                    </Link>                                      
                  </li>
                );
              } else{
                return null;
              }
            })}
        </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
