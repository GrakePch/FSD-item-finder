import "./ClockFace.css";

interface ClockFaceProps {
  hourAngleDeg: number;
  sunriseHourAngleDeg: number;
  colorDay?: string;
  colorDawn?: string;
  colorNight?: string;
}

const ClockFace = ({
  hourAngleDeg,
  sunriseHourAngleDeg,
  colorDay = "#dceaff",
  colorDawn = "#af5e53",
  colorNight = "#192029",
}: ClockFaceProps) => {
  return (
    <div
      className="ClockFace"
      style={
        {
          "--color-day": colorDay,
          "--color-dawn": colorDawn,
          "--color-dusk": colorDawn,
          "--color-night": colorNight,
          "--hand-direction": `${-hourAngleDeg}deg`,
          "--sunrise-hour-angle": `${
            sunriseHourAngleDeg > 180
              ? 180
              : sunriseHourAngleDeg < 0
              ? -12
              : sunriseHourAngleDeg
          }deg`,
        } as React.CSSProperties
      }
    >
      <div className="face"></div>
      <div className="hand"></div>
    </div>
  );
};
export default ClockFace;
