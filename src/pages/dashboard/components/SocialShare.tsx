import { IoLogoFacebook, IoLogoWhatsapp } from "react-icons/io";
import { IoLogoTwitter, IoMailOutline } from "react-icons/io5";
import {
  EmailShareButton,
  FacebookShareButton,
  // LinkedinShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";

type Props = {
  url: string;
};

const SocialShare = ({ url }: Props) => {
  return (
    <div className="flex items-center justify-between">
      <EmailShareButton url={url} className="mr-4">
        <IoMailOutline className="text-4xl m-auto" />
        <p className="text-sm">Email</p>
      </EmailShareButton>

      <FacebookShareButton url={url} className="mr-4">
        <IoLogoFacebook className="text-4xl m-auto" />
        <p className="text-sm">Facebook</p>
      </FacebookShareButton>

      {/* <LinkedinShareButton url={url} className="mr-4">
        <IoLogoLinkedin className="text-4xl m-auto" />
        <p className="text-sm">Linkedin</p>
      </LinkedinShareButton> */}

      <TwitterShareButton url={url} className="mr-4">
        <IoLogoTwitter className="text-4xl m-auto" />
        <p className="text-sm">Twitter</p>
      </TwitterShareButton>

      <WhatsappShareButton url={url} className="mr-4">
        <IoLogoWhatsapp className="text-4xl m-auto" />
        <p className="text-sm">Whatsapp</p>
      </WhatsappShareButton>
    </div>
  );
};

export default SocialShare;
