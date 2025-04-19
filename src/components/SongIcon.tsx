import React from "react";

type SongIconProps = {
  albumArtUrl: string;
  title: string;
  artist: string;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
};

const SongIcon: React.FC<SongIconProps> = ({
  albumArtUrl,
  title,
  artist,
  onClick,
  selected = false,
  className = "",
}) => {
  return (
    <button
      className={`flex flex-col items-center w-40 p-2 transition 
                  hover:scale-105 focus:outline-none font-mono ${className}`}
      onClick={onClick}
      tabIndex={0}
      aria-label={`View details for ${title} by ${artist}`}
      type="button"
    >
      <img
        src={albumArtUrl}
        alt={`Album cover for ${title} by ${artist}`}
        className="w-32 h-32 object-cover mb-1"
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
