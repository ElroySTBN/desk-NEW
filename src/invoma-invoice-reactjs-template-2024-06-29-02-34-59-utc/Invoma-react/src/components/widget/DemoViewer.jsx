import { Link } from "react-router-dom";

export default function DemoViewer({imgUrl, path, title}) {
  return (
    <Link target="_blank" to={path}
      className="tm_demo tm_text_center tm_primary_color tm_accent_color_hover" >
      <img src={imgUrl} alt="" />
      <div className="tm_demo_info">
        <h3>{title}</h3>
      </div>
    </Link>
  )
}
