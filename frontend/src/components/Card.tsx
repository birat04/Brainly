import { ShareIcon } from "../icons/ShareIcon";
interface CardProps{
    title: string;
    link: string;
    type: "video" | "article" | "image";
}
export function Card({title,link,type}: CardProps) {
    return (
        <div className="p-8 bg-white rounded-md shadow-md outline-grey-100 max-w-72 border">
            <div className="flex justify-between mb-4">
                <div className="flex pr-4 items-center text-md">
                    <div className="pr-2 text-grey-500">
                        <ShareIcon />
                    </div>
                    {title}
                </div>
                <div className="flex gap-2">
                    <div className="pr-2 text-grey-500 items-center">
                        <a href = {link} target="_blank">
                            <ShareIcon />
                        </a>
                    </div>
                    <div className="pr-2 text-grey-500 items-center">
                        <ShareIcon />
                    </div>
                </div>
            </div>
            <div className="pt-4">
                {type === "video" && 
                <iframe className="w-100 aspect-video"
                    src={link.replace("watch", "embed").replace("v=", "RBSGKlAvoiM")}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                   
                ></iframe>
                }
                
            </div>
        </div>
    );
}