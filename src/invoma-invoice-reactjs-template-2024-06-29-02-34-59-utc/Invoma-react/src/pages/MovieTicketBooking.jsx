import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import Terms from "../components/termsAndConditions/Terms";
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo";
import {currentDate5, pageTitle } from "../helper/helper";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import TableStyle10 from "../components/table/TableStyle10";
import SubTotalStyle3 from "../components/subTotal/SubTotalStyle3";

const tableData = [
  {
    item: 'The Batman',
    desc: '22 July 2022 at 2.30pm - General Seat',
    price: '200',
    qty: '2', 
  },
  {
    item: 'The Rise of Gru',
    desc: '22 July 2022 at 2.30pm - General Seat',
    price: '150',
    qty: '4', 
  },
]

const termsAndCondition = [
  'All claims relating to quantity or shipping errors shall be waived by Buyer unless made in writing to Seller within thirty (30) days after delivery of goods to the address stated.',
  'Delivery dates are not guaranteed and Seller has no liability for damages that may be incurred due to any delay in shipment of goods hereunder. Taxes are excluded unless otherwise stated.'
]

export default function MovieTicketBooking() {
  pageTitle('Movie Ticket');
  const invoicePage= useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const taxPersent = 11;
  const taxAmount = subTotal * taxPersent / 100;
  const grandTotal = (subTotal + taxAmount);
  
  return (
    <>
      <div className="tm_invoice tm_style1 tm_type1" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <div className="tm_invoice_head tm_mb15 tm_align_center">
            <div className="tm_invoice_left">
              <div className="tm_logo">
                <img src="/images/logo.svg" alt="Logo" />
              </div>
            </div>
            <div className="tm_invoice_right tm_text_right tm_mobile_hide">
              <div className="tm_f50 tm_text_uppercase tm_white_color">Invoice</div>
            </div>
            <div className="tm_shape_bg tm_accent_bg tm_mobile_hide">
              <img src="/images/header_bg.jpeg" alt="" />
            </div>
          </div>
          <div className="tm_invoice_info tm_mb25">
            <div className="tm_card_note tm_ternary_color">
              <a href="#" className="tm_medium">
                www.invomacineplex.com
              </a>
            </div>
            <div className="tm_invoice_info_list tm_white_color">
              <p className="tm_invoice_number tm_m0">
                Invoice No: <b>#LL93784</b>
              </p>
              <p className="tm_invoice_date tm_m0">
                Date: <b>{currentDate5()}</b>
              </p>
            </div>
            <div className="tm_invoice_seperator tm_accent_bg">
              <img src="/images/header_bg_2.jpeg" alt="" />
            </div>
          </div>
          <div className="tm_invoice_head tm_mb20">
            <InvoiceToPayTo
              varient='tm_invoice_left'
              title='Purcheser Info'
              subTitle='<b className="tm_primary_color tm_medium">Name:</b> Jhon Doe <br />
                <b className="tm_primary_color tm_medium">Email:</b> jhondoe@gmail.com
                <br />
                <b className="tm_primary_color tm_medium">Phone:</b> +99-152-287-213
                <br />
                <b className="tm_primary_color tm_medium">Address:</b> 84 Spilman
                Street, London'
            />
            <InvoiceToPayTo
              varient='tm_invoice_right tm_text_right'
              title='Invoma Cineplex'
              subTitle=' 86-90 Paul Street, London <br />
                England EC2A 4NE <br />
                demo@gmail.com <br />
                +99-879-213-256'
            />
          </div>
          <div className="tm_table tm_style1">
            <div className="tm_border_top">
              <div className="tm_table_responsive">
                <TableStyle10 data={tableData}/>
              </div>
            </div>
            <div className="tm_invoice_footer tm_border_top">
              <PaymentInfo
                varient='tm_left_footer  tm_padd_left_15_md'
                title='Payment Info'
                cardType='Cradit Card'
                cardNumber='236***********928'
                amount={grandTotal}
                author="Jhon Doe"
              />
              <div className="tm_right_footer">
                <SubTotalStyle3
                  subTotal={subTotal}
                  taxPersent={taxPersent}
                  taxAmount={taxAmount}
                  grandTotal={grandTotal}
                  bg='tm_gray_bg'
                  textColor='tm_primary_color'
                  gtBg='tm_primary_bg'
                  gtTextColor='tm_white_color'
                />
              </div>
            </div>
          </div>
          <Terms 
            varient='tm_border'
            title='Terms of use:' 
            data={termsAndCondition}
          />
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
