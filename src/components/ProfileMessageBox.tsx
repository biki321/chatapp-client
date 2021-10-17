import pp_male from "../static/img/male.png";
import pp_female from "../static/img/female.png";
import "../static/style/profileMessageBox.css";
import IModifiedUser from "../interfaces/iModifiedUser.interface";

interface IProps {
  profile: IModifiedUser;
}

export default function ProfileMessageBox({ profile }: IProps) {
  return (
    <div className="profile">
      {/* <AiOutlineArrowLeft className="back-arrow" /> */}
      <img
        src={profile.gender === "male" ? pp_male : pp_female}
        className="profile-pic"
        alt=""
      />

      <div className="profile-name">
        <h2>{profile.username}</h2>
        <span>{profile.online ? "online" : null}</span>
      </div>
    </div>
  );
}
