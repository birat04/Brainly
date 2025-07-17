import { PreviewIcon } from "../icons/PreviewIcon";
import { DeleteIcon } from "../icons/DeleteIcon";

interface CardProps {
  title: string;
  link: string;
  type: "video" | "article" | "image";
  onDelete?: () => void;
}

function getEmbed(link: string) {
  try {
    const url = new URL(link);
    const host = url.hostname.replace("www.", "");

    if (host.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      return {
        src: id ? `https://www.youtube.com/embed/${id}` : link,
        width: "100%",
        height: "100%",
        allow:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      };
    }

    if (host.includes("youtu.be")) {
      const id = url.pathname.slice(1);
      return {
        src: `https://www.youtube.com/embed/${id}`,
        width: "100%",
        height: "100%",
        allow:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      };
    }

    if (host.includes("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return {
        src: `https://player.vimeo.com/video/${id}`,
        width: "100%",
        height: "100%",
        allow: "autoplay; fullscreen; picture-in-picture",
      };
    }

    if (host.includes("ted.com")) {
      return {
        src: link.replace("https://www.ted.com/talks", "https://embed.ted.com/talks"),
        width: "100%",
        height: "100%",
        allow: "fullscreen",
      };
    }

   
  } catch (err) {
    console.error("Invalid URL", err);
  }

  return null;
}

export function Card({ title, link, type, onDelete }: CardProps) {
  const embed = type === "video" ? getEmbed(link) : null;

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border w-full max-w-md mx-auto">
      <div className="flex justify-between items-start mb-4">
        <h3 className="flex items-center gap-2 text-md font-medium leading-tight">
            <DeleteIcon
                className="w-5 h-5 text-red-500 hover:text-red-700"
                onClick={onDelete}
            />
          {title}
        </h3>

        <div className="flex gap-3">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700"
          >
            <PreviewIcon className="w-5 h-5" />
          </a>
        </div>
      </div>

      {type === "video" && embed && (
        <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={embed.src}
            width={embed.width}
            height={embed.height}
            allow={embed.allow}
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}

      {type === "article" && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Read article
        </a>
      )}

      {type === "image" && (
        <img
          src={link}
          alt={title}
          className="w-full h-auto rounded-lg object-cover"
        />
      )}
    </div>
  );
}
