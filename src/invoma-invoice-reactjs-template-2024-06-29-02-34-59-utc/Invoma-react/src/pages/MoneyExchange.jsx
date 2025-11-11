import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { currentDate5, pageTitle } from "../helper/helper";
import TermsStyle4 from "../components/termsAndConditions/TermsStyle4";
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo";
import Header from "../components/header/Header";


export default function MoneyExchange() {
  pageTitle('Money Exchange');
  const invoicePage= useRef();
  
  
  return (
    <>
      <div className="tm_invoice tm_style1" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <Header
            logo='/images/logo.svg'
            title='Invoice'
          />
          <div className="tm_invoice_info tm_mb25">
            <div className="tm_invoice_seperator tm_gray_bg" />
            <div className="tm_invoice_info_list">
              <p className="tm_invoice_number tm_m0">
                Invoice No: <b className="tm_primary_color">#LL93784</b>
              </p>
              <p className="tm_invoice_date tm_m0">
                Date: <b className="tm_primary_color">{currentDate5()}</b>
              </p>
            </div>
          </div>
          <div className="tm_invoice_head tm_mb10">
            <InvoiceToPayTo 
              varient='tm_invoice_left'
              title='Exchange Confirmation'
              subTitle='Funded 27 July 2022 <br />
              Paid out 30 July 2022 <br />
              Transfer ID #23409 <br />
              Membership LL23209'
            />
            <InvoiceToPayTo 
              varient='tm_invoice_right tm_text_right'
              title='Invoma Banking'
              subTitle='86-90 Paul Street, London<br />
              England EC2A 4NE <br />
              support@email.com <br />
              +99-093-234-128'
            />
            
          </div>
          <h2 className="tm_f16 tm_section_heading tm_border_color tm_mb15">
            <span className="tm_gray_bg">Transfer Overview</span>
          </h2>
          <div className="tm_grid_row tm_col_3 tm_mb30">
            <div>
              <span>Ammount paid by Johan Smith</span>
              <br />
              <b className="tm_primary_color tm_medium">5000 USD</b>
            </div>
            <div>
              <span>Transfer Fee</span>
              <br />
              <b className="tm_primary_color tm_medium">18.71 USD</b>
            </div>
            <div>
              <span>Abbount converted</span>
              <br />
              <b className="tm_primary_color tm_medium">34762.23 CAD</b>
            </div>
            <div>
              <span>Exchange rate</span>
              <br />
              <b className="tm_primary_color tm_medium">1 USD = 1.27 CAD</b>
            </div>
            <div>
              <span>Converted and send to</span>
              <br />
              <b className="tm_primary_color tm_medium">5000 CAD</b>
            </div>
          </div>
          <h2 className="tm_f16 tm_section_heading tm_border_color tm_mb15">
            <span className="tm_gray_bg">Send To</span>
          </h2>
          <div className="tm_grid_row tm_col_2 tm_mb30">
            <div>
              <p className="tm_mb6">
                <b className="tm_primary_color tm_medium">Bank Name And Branch:</b>{" "}
                Toronto Bank
              </p>
              <p className="tm_mb6">
                <b className="tm_primary_color tm_medium">SWIFT / BIC Code:</b>{" "}
                MSV24678665RT
              </p>
              <p className="tm_mb0">
                <b className="tm_primary_color tm_medium">Reference:</b> 1298762534982
              </p>
            </div>
            <div>
              <p className="tm_mb6">
                <b className="tm_primary_color tm_medium">Account Number:</b>{" "}
                2465789456324
              </p>
              <p className="tm_mb6">
                <b className="tm_primary_color tm_medium">Account Name:</b> Johan
                Smith
              </p>
              <p className="tm_mb0">
                <b className="tm_primary_color tm_medium">Address:</b> 84 Spilman
                Street, London, United Kingdom
              </p>
            </div>
          </div>
          <h2 className="tm_f16 tm_section_heading tm_border_color tm_mb15">
            <span className="tm_gray_bg">Paid Out From</span>
          </h2>
          <div className="tm_grid_row tm_col_3 tm_mb30">
            <div>
              <span>Bank Name And Branch: </span>
              <br />
              <b className="tm_primary_color tm_medium">Canadian Bank</b>
            </div>
            <div>
              <span>Delivered By: </span>
              <br />
              <b className="tm_primary_color tm_medium">Cash</b>
            </div>
            <div>
              <span>Reference: </span>
              <br />
              <b className="tm_primary_color tm_medium">SM2455452114545</b>
            </div>
          </div>
          <TermsStyle4 
            varient='tm_padd_15_20 tm_round_border'
            title='Terms and conditions'
            subTitle="Delivery dates are not guaranteed and Seller has no liability for
            damages that may be incurred due to any delay in shipment of goods
            hereunder. Taxes are excluded unless otherwise stated."
          />
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
