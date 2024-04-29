import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useEffect, useState } from "react";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

const New = ({ inputs, title }) => {
  const [file, setFile] = useState("");
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [file3, setFile3] = useState(null)
  const [data, setData] = useState({});
  const [per, setPerc] = useState(null);
  
  const navigate = useNavigate();

  const handleFile1Change = (e) => {
    setFile1(e.target.files[0]);
    // console.log("file upload") 
  };

  const handleFile2Change = (e) => {
    setFile2(e.target.files[0]);
  };

  const handleFile3Change = (e) => {
    setFile3(e.target.files[0]);
  };

  useEffect(() => {
    const handleUpload = async () => {  
      const name = new Date().getTime() + file1.name;
      const storageRef = ref(storage, file1.name);
      const uploadTask = uploadBytesResumable(storageRef, file1);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // console.log("Upload is " + progress + "% done");
          setPerc(progress);
          switch (snapshot.state) {
            case "paused":
              // console.log("Upload is", progress, "% done");
              break;
            case "running":
              // console.log("Upload is running");
              break;
            default:
              break;
          }
        },
        (error) => {
          // console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setData((prev) => ({ ...prev, file1: downloadURL }));
          });
        }
      );
      // console.log(name);
      if (!file1 || !file2 || !file3) {
        // console.error('Please select all three files.');
        return;
      }
      const user_id = "";
      const combinedFile = new Blob([file, file1, file2, file3], { type: 'application/zip' });
      const typeWithUserId = `Templates/${user_id}`;
      // console.log({user_id});
      const fileRef = storageRef.child('combinedFiles.zip');
      try {
        // await fileRef.put(combinedFile);
        await fileRef.put(storageRef, combinedFile, { contentType: typeWithUserId });
        // console.log('Combined file uploaded successfully.');
        setFile1(null);
        setFile2(null);
        setFile3(null);
      } catch (error) {
        // console.error('Error uploading combined file:', error);
      }
    };
    const uploadFile = () => {
      const name = new Date().getTime() + file.name;
      // console.log(name);
      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // console.log("Upload is " + progress + "% done");
          setPerc(progress);
          switch (snapshot.state) {
            case "paused":
              // console.log("Upload is paused");
              break;
            case "running":
              // console.log("Upload is running");
              break;
            default:
              break;
          }
        },
        (error) => {
          // console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setData((prev) => ({ ...prev, img: downloadURL }));
          });
        }
      );
      handleUpload();
      // console.log(handleUpload)
    };
    file && uploadFile();
  }, [file, file1, file2, file3]);

  // console.log(data);

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;

    setData({ ...data, [id]: value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      await setDoc(doc(db, "Templates", res.user.uid), {
        ...data,
        timeStamp: serverTimestamp(),
      });
      // console.log(res.id);
    } catch (err) {
      // console.log(err);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt=""
            />
          </div>
          <div className="right">
            <form onSubmit={handleAdd}>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>
              <div className="file-upload">
                <div className="file-select">
                  <div className="file-select-button" id="fileName">
                    Choose File
                  </div>
                  <div className="file-select-name" id="noFile">
                    No file chosen...
                  </div>
                  <input type="file" name="chooseFile" id="chooseFile1" onChange={handleFile1Change} />
                </div>
              </div>
              <div className="file-upload">
                <div className="file-select">
                  <div className="file-select-button" id="fileName">
                    Choose File
                  </div>
                  <div className="file-select-name" id="noFile">
                    No file chosen...
                  </div>
                  <input type="file" name="chooseFile" id="chooseFile2" onChange={handleFile2Change} />
                </div>
              </div>
              <div className="file-upload">
                <div className="file-select">
                  <div className="file-select-button" id="fileName">
                    Choose File
                  </div>
                  <div className="file-select-name" id="noFile">
                    No file chosen...
                  </div>
                  <input type="file" name="chooseFile" id="chooseFile3" onChange={handleFile3Change} />
                </div>
              </div>
              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    type={input.type}
                    placeholder={input.placeholder}
                    onChange={handleInput}
                  />
                </div>
              ))}
              <button disabled={per !== null && per < 100} type="submit">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
