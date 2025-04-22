import React from "react";
import Image from "next/image";

type SongIconProps = {
  albumArtUrl: string;
  title: string;
  artist: string;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const SongIcon: React.FC<SongIconProps> = ({
  albumArtUrl,
  title,
  artist,
  onClick,
  selected = false,
  className = "",
  style = {},
}) => {
  return (
    <button
      className={`flex flex-col items-center w-40 p-2 transition 
                  hover:scale-105 focus:outline-none font-mono ${className}
                  ${selected ? "bg-pink-100 rounded-lg" : ""}`}
      onClick={onClick}
      tabIndex={0}
      aria-label={`View details for ${title} by ${artist}`}
      type="button"
      style={style}
    >
      <Image
        src={albumArtUrl}
        alt={`Album cover for ${title} by ${artist}`}
        width={128}
        height={128}
        className="object-cover mb-1 rounded-sm"
        draggable={false}
      />
      <div className="w-full text-center">
        <div className="text-xs font-medium truncate" title={title}>
          {title}
        </div>
        <div className="text-[10px] text-gray-600 truncate" title={artist}>
          {artist}
        </div>
      </div>
    </button>
  );
};

export default SongIcon;
