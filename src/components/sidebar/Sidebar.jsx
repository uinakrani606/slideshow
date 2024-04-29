import "./sidebar.scss";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, onSnapshot  } from "firebase/firestore";
import { db } from "../../firebase";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
const Sidebar = () => {
  const [data, setData] = useState([]);
  // console.log(data);
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
      <div className="center">
      <div className="search">
          <input type="text" placeholder="Search..." />
          <SearchOutlinedIcon />
        </div>
        <div>
          <p className="title">MAIN</p>
          
          {data.map((item, index) => {
            return (
              <ul key={index}>
                <Link to={'/image-annotator/'+item.id} state={item}>
                  <li key={index}>{item.name}</li>
                </Link>
              </ul>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
