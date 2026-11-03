// Real footage used on the bucket list, encoded at three sizes and in two
// codecs (see Footage.jsx for how one is picked). From Pexels, free to use
// without attribution; credited in the footer anyway.
import vinylUhd from "../assets/bucket/vinyl-4k.mp4";
import vinylUhdAv1 from "../assets/bucket/vinyl-4k-av1.mp4";
import vinylHd from "../assets/bucket/vinyl-1080.mp4";
import vinylHdAv1 from "../assets/bucket/vinyl-1080-av1.mp4";
import vinylSd from "../assets/bucket/vinyl-720.mp4";
import vinylSdAv1 from "../assets/bucket/vinyl-720-av1.mp4";
import vinylPoster from "../assets/bucket/vinyl-poster.jpg";

export const FOOTAGE = {
  // A record spinning on a turntable, close and low.
  vinyl: {
    sources: {
      uhd: { h264: vinylUhd, av1: vinylUhdAv1 },
      hd: { h264: vinylHd, av1: vinylHdAv1 },
      sd: { h264: vinylSd, av1: vinylSdAv1 },
    },
    poster: vinylPoster,
  },
};

export const FOOTAGE_CREDITS = [
  { what: "Vinyl", who: "Miguel Á. Padriñán", url: "https://www.pexels.com/video/5983040/" },
];
