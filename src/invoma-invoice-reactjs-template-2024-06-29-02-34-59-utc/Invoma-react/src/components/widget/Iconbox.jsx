import parser from 'html-react-parser';

export default function Iconbox({icon, title}) {
  return (
    <div className="tm_text_center tm_iconbox">
      <p className="tm_accent_color tm_mb0">
        <img src={icon} alt="ert" />
      </p>
      {parser(title)}
    </div>
  )
}
