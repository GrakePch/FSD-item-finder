import styles from "./ClockFace.module.css";

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
      className={styles.ClockFace}
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
      <div className={styles.face}></div>
      <div className={styles.hand}></div>
    </div>
  );
};
export default ClockFace;
