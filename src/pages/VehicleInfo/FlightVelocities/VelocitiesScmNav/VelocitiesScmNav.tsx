import "./VelocitiesScmNav.css";

interface VelocitiesScmNavProps {
  scm: number;
  scmBoostF: number;
  scmBoostB: number;
  nav: number;
  max: number;
}

const VelocitiesScmNav = ({
  scm,
  scmBoostF,
  scmBoostB,
  nav,
  max,
}: VelocitiesScmNavProps) => {
  return (
    <div className="VelocitiesScmNav">
      <div className="nav" style={{ width: (nav / max) * 100 + "%" }}></div>
      <div
        className="scm-boost-forward-left"
        style={{
          height: (scmBoostF / max) * 50 + "%",
          width: (scmBoostB / max) * 50 + "%",
        }}
      ></div>
      <div
        className="scm-boost-forward-right"
        style={{
          height: (scmBoostF / max) * 50 + "%",
          width: (scmBoostB / max) * 50 + "%",
        }}
      ></div>
      <div
        className="scm-boost-backward"
        style={{
          height: (scmBoostB / max) * 50 + "%",
          width: (scmBoostB / max) * 100 + "%",
        }}
      ></div>
      <div className="scm" style={{ width: (scm / max) * 100 + "%" }}></div>
      <div className="axis-fb"></div>
      <div className="axis-lr"></div>
      <div className="text value-nav">{Math.round(nav)} m/s</div>
      <div className="text value-scm-boost-forward">{Math.round(scmBoostF)} m/s</div>
      <div className="text value-scm">{Math.round(scm)} m/s</div>
      <div className="text title-nav">NAV</div>
      <div className="text title-scm-boost-forward">Boost</div>
      <div className="text title-scm">SCM</div>
    </div>
  );
};

export default VelocitiesScmNav;
