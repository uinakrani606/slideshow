import Home from "./pages/home/Home";
import NewTemplate from "./pages/NewTemplate/NewTemplate";
import Sidebar from "./components/sidebar/Sidebar";
import Navbar from "./components/navbar/Navbar";
import Login from "./pages/login/Login";
import ImageGeneration from "./pages/imageGeneration";
import "./App.scss"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import ImageAnnotator from "./pages/image-annotator/image-annotator";

function App() {
  const { currentUser } = useContext(AuthContext);

  const RequireAuth = ({ children }) => {
    return currentUser ? (
      <>
      {children}
      </>
    ) : <Navigate to="/login" />;
  };
  return (
    <div className={"app"}>
      <BrowserRouter>
      {currentUser ? (
        <>
        <div className="home">
        <Sidebar />
        <div className="homeContainer">
          <Navbar />
          <Routes>
            <Route path="/">
              <Route path="login" element={<Login />} />
              <Route
                index
                element={
                  <RequireAuth>
                    <Home />
                  </RequireAuth>
                }
              />
              <Route path="image-generation" element={<ImageGeneration />} />
              <Route path="/image-annotator/:id">
                <Route index element={
                    <RequireAuth>
                      <ImageAnnotator />
                    </RequireAuth>
                } />
              </Route>
                <Route path="template/create" element={
                  <RequireAuth>
                    <NewTemplate />
                  </RequireAuth>
                } />
            </Route>
          </Routes>
        </div>
      </div>
        </>
      ) : (
        <Routes>
            <Route path="/">
              <Route
                  index
                  element={
                    <RequireAuth>
                      <Home />
                    </RequireAuth>
                  }
                />
              <Route path="/login" element={<Login />} />
            </Route>
          </Routes>
      )}
        
      </BrowserRouter>
    </div>
  );
}

export default App;
