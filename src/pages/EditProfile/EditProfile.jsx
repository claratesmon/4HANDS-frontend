import './EditProfile.css'
import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from '../../context/auth.context';
import service from "../../services/file-upload.service";

function EditProfile() {
  const [userPut, setUserPut] = useState('')
  const [location, setLocation] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  let [skills, setSkills] = useState([])
  const [description, setDescription] = useState('')
  const [helpImageUrl, setHelpImageUrl] = useState("");

  const { isLoggedIn, user, logOutUser } = useContext(AuthContext);
  const BACKEND_ROOT = import.meta.env.VITE_SERVER_URL;
  const userIdFromAuth = user._id
  const navigate = useNavigate()

  const handleFileUpload = (e) => {
    console.log("The file to be uploaded is: ", e.target.files);

    const uploadData = new FormData();

    uploadData.append('profilePicture', e.target.files[0]);

    console.log("UploadData", uploadData);
    service
      .uploadImageProfile(uploadData)
      .then(response => {
        console.log("response is: ", response);
        // response carries "fileUrl" which we can use to update the state
        setProfilePicture(response.fileUrl);
      })
      .catch(err => console.log("Error while uploading the file: ", err));
  };


  useEffect(() => {
    fetch(`${BACKEND_ROOT}/user/${userIdFromAuth}`)
      .then((response) => {
        return response.json();
      })
      .then((responsejson) => {
        setLocation(responsejson.location)
        setProfilePicture(responsejson.profilePicture)
        setSkills(responsejson.skills)
        setDescription(responsejson.description)
      })
      .catch((err) => console.log(err))
  },[])

  const handleSkillsChange = (event) => {
    const selectedSkills = Array.from(event.target.selectedOptions, option => option.value);
    console.log(selectedSkills)
    setSkills(selectedSkills);
;
  };

  const putData = (event) => {
    event.preventDefault();
    const updatedUser = {
      location,
      profilePicture,
      skills: skills.join(', '),
      description,
      id: user._id
    };
    setUserPut(updatedUser)
  
    fetch(`${BACKEND_ROOT}/user/edituser`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
      mode: 'cors'
    })
      .then((response) => {
        return response.json();
      })
      .then((editedUser) => {
        setUserPut(editedUser)
        console.log(editedUser)
        navigate("/myprofile")
      })
      .catch((err) => (console.log(err)));
  }
  
  

  return (
    <div>
      <h1>Edit my profile</h1>
      <form encType="multipart/form-data" onSubmit={(event) => putData(event)}>
        <div className='edit-profile-container'>
          <label htmlFor="location">Location: </label>
          <textarea type="textarea" name="location" id='location' value={location} onChange={(event) => setLocation(event.target.value)} />
          <br />
          <label htmlFor="profilePicture">Profile Picture: </label>
          <input type="file" accept="image/*" className="image-input"

            onChange={(event) => handleFileUpload(event)}
            name="profilePicture"
            id="profilePicture" />
          {profilePicture && <img className="img-preview" src={profilePicture} alt="User Profile Image" />}

          <br />
          <label htmlFor="skills">Skills: </label>
        
          <select name="skills" id='skills' multiple size="4" value={skills} onChange={handleSkillsChange}>
            <option value="">--Please choose up to 4 skills--</option>
            <option value="Languages">Languages</option>
            <option value="Tech">Tech</option>
            <option value="Strength">Strength</option>
            <option value="Dancing">Dancing</option>
            <option value="Active listening">Active listening</option>
            <option value="Body disciplines">Body disciplines</option>
            <option value="Coaching">Coaching </option>
            <option value="Humor">Humor</option>
            <option value="Sports">Sports</option>
          </select>
          <br />
          <label htmlFor="description">Description: </label>
          <textarea type="textarea" name="description" id='description' value={description} onChange={(event) => setDescription(event.target.value)} />
          <br />
          <button className='edit-send' type="submit">Send</button>
        </div>
      </form>
    </div >
  );
}

export default EditProfile;