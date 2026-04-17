import React from "react";
import { playlists } from "./data";

export default function DjScreen() {
  return (
    <div>
      <h2>DJ</h2>

      <iframe
        src={playlists[0].embed}
        width="100%"
        height="300"
        title="music"
      />
    </div>
  );
}
