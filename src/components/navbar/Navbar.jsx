import { useContext, useState } from "react";
import {AuthContext} from "../../context/AuthContext"
import "./navbar.scss";
import { getAuth, signOut } from "firebase/auth";

const Navbar = () => {
  const [error, setError] = useState(false);

  const {dispatch} = useContext(AuthContext)

  const handleLogout = (e) => {
    e.preventDefault();

    const auth = getAuth();
    signOut(auth).then(() => {
      dispatch({type:"LOGOUT"})

    }).catch((error) => {
      setError(true);
      console.log(error)
    });
  };
  return (
    <div className="navbar">
      <div className="wrapper">
        <div className="items">
          <div className="item">
            <span className="cursor-pointer" onClick={handleLogout}>Logout</span>
          </div>
          <div className="item">
            <img
              src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt=""
              className="avatar"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
