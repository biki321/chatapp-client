import pp from "../static/img/pp.png";
import "../static/style/profileMessageBox.css";
import IModifiedUser from "../interfaces/iModifiedUser.interface";
import { AiOutlineArrowLeft } from "react-icons/ai";

interface IProps {
  profile: IModifiedUser;
}

export default function ProfileMessageBox({ profile }: IProps) {
  return (
    <div className="profile">
      {/* <img src={arrow} className="back-arrow" alt="" /> */}
      <AiOutlineArrowLeft className="back-arrow" />
      <img src={profile.avatar || pp} className="profile-pic" alt="" />

      <div className="profile-name">
        <h2>{profile.username}</h2>
        <span>{profile.online ? "online" : null}</span>
      </div>
    </div>
  );
}
