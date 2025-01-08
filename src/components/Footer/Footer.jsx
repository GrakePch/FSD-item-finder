import "./Footer.css";
import uexBadge from "../../assets/uex-api-badge-powered.png";

const Footer = ({style}) => {
  return (
    <div className="Footer" style={style}>
      <div className="uex">
        <a href="https://uexcorp.space/" target="_blank">
          <p>数据支持</p>
        </a>
        <a href="https://uexcorp.space/" target="_blank">
          <img src={uexBadge} width="140" />
        </a>
      </div>
      <p>
        <a href="https://github.com/GrakePch/FSD-item-finder/issues" target="_blank">
          问题反馈
        </a>
      </p>
      <p>设计与开发：GrakePCH</p>
      <p>技术支持：CxJuice</p>
    </div>
  );
};

export default Footer;
