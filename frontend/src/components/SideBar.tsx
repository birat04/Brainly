import  { SideBarItem } from "./SideBarItem";
import { TwitterIcon } from "../icons/TwitterIcon";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { Logo } from "../icons/Logo";

export function SideBar() {
  return (
    <div className="h-screen bg-white border-r w-72 fixed left-0 top-0 p-4 shadow-md pl-6">
        <div className="flex text-3xl pt-8 items-center">
            <div className="pr-2 text-purple-800">
            <Logo />
            </div>

            Brainly
        </div>
     <div className="pt-8 pl-4">
        <SideBarItem text="Twitter" icon={<TwitterIcon />} />
        <SideBarItem text="Youtube" icon={<YoutubeIcon />} />
     </div>
    </div>
  );
}
