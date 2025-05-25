import {
  mdiArrowRightCircleOutline,
  mdiCamera,
  mdiChessRook,
  mdiChevronDownCircleOutline,
  mdiCloseCircleOutline,
  mdiHomeVariant,
  mdiPackageVariantClosed,
  mdiRecordCircleOutline,
  mdiRecycleVariant,
  mdiRhombusOutline,
  mdiRun,
  mdiStar,
  mdiStarOutline,
  mdiTrophyVariantOutline,
  mdiWhiteBalanceSunny,
} from "@mdi/js";

const locationIcon: Record<string, string> = {
  Star: mdiWhiteBalanceSunny,
  "Lagrange Point": mdiRhombusOutline,
  "Jump Point":
    "M146.831,339.982c-10.999,36.58 -27.897,60.018 -46.831,60.018c-33.115,0 -60,-71.694 -60,-160c0,-88.306 26.885,-160 60,-160c18.934,0 35.832,23.438 46.831,60.018c19.997,23.046 51.116,47.482 93.169,47.482c42.053,0 73.172,-24.436 93.169,-47.482c10.999,-36.58 27.897,-60.018 46.831,-60.018c33.115,0 60,71.694 60,160c0,88.306 -26.885,160 -60,160c-18.934,0 -35.832,-23.438 -46.831,-60.018c-19.997,-23.046 -51.116,-47.482 -93.169,-47.482c-42.053,0 -73.172,24.436 -93.169,47.482Zm176.176,-150.101c-22.256,15.944 -50.012,27.619 -83.007,27.619c-32.995,0 -60.751,-11.675 -83.007,-27.619c1.951,15.768 3.007,32.617 3.007,50.119c-0,17.502 -1.056,34.351 -3.007,50.119c22.256,-15.944 50.012,-27.619 83.007,-27.619c32.995,0 60.751,11.675 83.007,27.619c-1.951,-15.768 -3.007,-32.617 -3.007,-50.119c-0,-17.502 1.056,-34.351 3.007,-50.119Zm-223.007,-49.881c-18.397,-0 -33.333,44.808 -33.333,100c-0,55.192 14.936,100 33.333,100c18.397,0 33.333,-44.808 33.333,-100c0,-55.192 -14.936,-100 -33.333,-100Zm280,0c-18.397,0 -33.333,44.808 -33.333,100c-0,55.192 14.936,100 33.333,100c18.397,0 33.333,-44.808 33.333,-100c0,-55.192 -14.936,-100 -33.333,-100Z",
  "Space station":
    "M7.782,17.632L3.707,21.707L2.293,20.293L6.368,16.218C3.045,12.398 2.364,7.494 4.929,4.929C7.494,2.364 12.398,3.045 16.218,6.368L20.293,2.293L21.707,3.707L17.632,7.782C20.955,11.602 21.636,16.506 19.071,19.071C16.506,21.636 11.602,20.955 7.782,17.632ZM6.343,6.343C5.627,7.059 5.346,8.071 5.371,9.17C5.419,11.249 6.529,13.6 8.464,15.536C10.4,17.471 12.751,18.581 14.83,18.629C15.929,18.654 16.941,18.373 17.657,17.657C18.373,16.941 18.654,15.929 18.629,14.83C18.581,12.751 17.471,10.4 15.536,8.464C13.6,6.529 11.249,5.419 9.17,5.371C8.071,5.346 7.059,5.627 6.343,6.343Z",
  "Landing zone": mdiStar,
  CommArray:
    "M19.2,17.4c0.994,-0 1.8,0.806 1.8,1.8c0,0.994 -0.806,1.8 -1.8,1.8c-0.994,-0 -1.8,-0.806 -1.8,-1.8c0,-0.994 0.806,-1.8 1.8,-1.8Zm-16.2,1.8c-0,-8.941 7.259,-16.2 16.2,-16.2l0,2.43c-7.6,-0 -13.77,6.17 -13.77,13.77l-2.43,-0Zm4.86,-0c-0,-6.259 5.081,-11.34 11.34,-11.34l0,2.43c-4.918,-0 -8.91,3.992 -8.91,8.91l-2.43,-0Zm4.86,-0c0,-3.577 2.903,-6.48 6.48,-6.48l0,2.43c-2.236,-0 -4.05,1.814 -4.05,4.05l-2.43,-0Z",
  "Asteroid base": mdiStarOutline,
  Scrapyard: mdiRecycleVariant,
  Racetrack: mdiTrophyVariantOutline,
  "Emergency shelter": mdiRun,
  Cave: "M23,18l-22,0l7.25,-10.67l2,2.67l3.75,-5l9,13Zm-8,-1l0,-2c0,-1.656 -1.344,-3 -3,-3c-1.656,0 -3,1.344 -3,3l0,2l6,0Z",
  "Distribution center": mdiPackageVariantClosed,
  Settlement: mdiHomeVariant,
  Landmark: mdiCamera,
  Shipwreck: mdiCamera,
  "Underground bunker": mdiChevronDownCircleOutline,
  Prison: mdiChessRook,
  Outpost: mdiRecordCircleOutline,
  Ruins: mdiCloseCircleOutline,
  "Forward operating base": mdiArrowRightCircleOutline,
  City: mdiRecordCircleOutline,
};

export default locationIcon;
