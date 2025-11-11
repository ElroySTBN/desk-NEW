import TermsStyle3 from "../termsAndConditions/TermsStyle3";

export default function Footer({title, logo, termsTitle, termsSubTitle}) {
  return (
    <div className="tm_bottom_invoice">
      <div className="tm_bottom_invoice_left">
        <p className="tm_m0 tm_f18 tm_accent_color tm_mb5">{title}</p>
        <TermsStyle3 title={termsTitle} subTitle={termsSubTitle} />
      </div>
      <div className="tm_bottom_invoice_right tm_mobile_hide">
        <div className="tm_logo">
          <img src={logo} alt="Logo" />
        </div>
      </div>
    </div>
  )
}
