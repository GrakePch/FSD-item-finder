import "./Footer.css";
import uexBadge from "../../assets/uex-api-badge-powered.png";

const Footer = () => {
  return (
    <>
      <div style={{ flexGrow: 1 }}></div>
      <div className="Footer">
        <div className="uex">
          <a href="https://uexcorp.space/" target="_blank">
            <p>数据支持</p>
          </a>
          <a href="https://uexcorp.space/" target="_blank">
            <img src={uexBadge} width="140" />
          </a>
        </div>
        <p>
          <a href="https://support.citizenwiki.cn/t/StarFinder" target="_blank">
            反馈平台
          </a>
          {" | "}
          <a href="https://github.com/GrakePch/FSD-item-finder" target="_blank">
            开源仓库
          </a>
        </p>
        <p>设计与开发：GrakePCH</p>
        <p>技术支持：CxJuice</p>
      </div>
    </>
  );
};

export default Footer;
