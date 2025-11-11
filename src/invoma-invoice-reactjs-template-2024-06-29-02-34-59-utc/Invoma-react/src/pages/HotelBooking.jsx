import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import { pageTitle } from "../helper/helper";
import SubTotalStyle2 from "../components/subTotal/SubTotalStyle2";
import Signature from "../components/widget/Signature";
import TermsStyle5 from "../components/termsAndConditions/TermsStyle5";
import TableStyle13 from "../components/table/TableStyle13";

const tableData = [
  {
    item: 'Room Charges',
    desc: 'Night',
    price: '500',
    qty: '3',
  },
  {
    item: 'Breakfast',
    desc: 'Day',
    price: '30',
    qty: '3',
  },
]

export default function HotelBooking() {
  pageTitle('Hotel Booking');
  const invoicePage= useRef();

  // calculation
  const serviceCharge = 10;
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0) + serviceCharge;
  const discountPersent = 10;
  const discountAmount = discountPersent != 0 ? subTotal * discountPersent / 100 : '';
  const taxPersent = 10;
  const taxAmount = (subTotal - discountAmount) * taxPersent / 100;
  const grandTotal = (subTotal - discountAmount) + taxAmount;
  
  return (
    <>
      <div className="tm_invoice tm_style2" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <div className="tm_invoice_content">
            <div className="tm_invoice_head tm_mb30">
              <div className="tm_invoice_left">
                <div className="tm_logo">
                  <img src="/images/logo.svg" alt="Logo" />
                </div>
              </div>
              <div className="tm_invoice_right tm_text_right">
                <b className="tm_f30 tm_medium tm_primary_color">Invoice</b>
                <p className="tm_m0">Invoice Number - LL87265</p>
              </div>
            </div>
            <div className="tm_invoice_info tm_mb25">
              <InvoiceToPayTo 
                varient=' tm_invoice_info_left'
                title='Invoma Hotel'
                subTitle=' 84 Spilman Street, London <br />
                United Kingdom. <br />
                lowell@gmail.com <br />
                +44(0) 327 123 987'
              />
              <div className="tm_invoice_info_right">
                <div className="tm_grid_row tm_col_3 tm_col_2_sm tm_invoice_info_in tm_gray_bg tm_round_border">
                  <div>
                    <span>Check In:</span> <br />
                    <b className="tm_primary_color">05 March 2022</b>
                  </div>
                  <div>
                    <span>Check Out:</span> <br />
                    <b className="tm_primary_color">10 March 2022</b>
                  </div>
                  <div>
                    <span>Booking ID:</span> <br />
                    <b className="tm_primary_color">124315</b>
                  </div>
                  <div>
                    <span>Nights:</span> <br />
                    <b className="tm_primary_color">3</b>
                  </div>
                  <div>
                    <span>Rooms:</span> <br />
                    <b className="tm_primary_color">1</b>
                  </div>
                  <div>
                    <span>Room type:</span> <br />
                    <b className="tm_primary_color">Single</b>
                  </div>
                </div>
              </div>
            </div>
            <div className="tm_grid_row tm_col_2 tm_invoice_info_in tm_round_border tm_mb30">
              <InvoiceToPayTo
                varient='tm_border_right tm_border_none_sm'
                title='Guest Info'
                subTitle=' Name: Jennifer Richards <br />
                Phone: +1-613-555-0141'
              />
              <InvoiceToPayTo
                varient=''
                title='Room And Service Details'
                subTitle='Room service is a hotel service enabling guests to choose items of
                food and drink for delivery to their hotel room for consumption.'
              />
            </div>
            <div className="tm_table tm_style1">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <TableStyle13  data={tableData} serviceCharge={serviceCharge}/>
                </div>
              </div>
              <div className="tm_invoice_footer tm_mb15">
                <PaymentInfo
                  varient='tm_left_footer'
                  title='Payment Info'
                  cardType='Credit Card'
                  cardNumber='236***********928'
                  amount={grandTotal}
                  author='Lowell H. Dominguez'
                />
                <div className="tm_right_footer">
                  <SubTotalStyle2
                    subTotal={subTotal}
                    discountAmount={discountAmount}
                    discountPersent={discountPersent}
                    taxPersent={taxPersent}
                    taxAmount={taxAmount}
                    grandTotal={grandTotal}
                    gtBg='tm_gray_bg '
                    gtColor='tm_primary_color '
                  />
                </div>
              </div>
              <div className="tm_invoice_footer tm_type1">
                <div className="tm_left_footer" />
                <div className="tm_right_footer">
                  <Signature
                    imgUrl='/images/sign.svg'
                    name='Jhon Donate'
                    designation='Accounts Manager'
                  />
                </div>
              </div>
            </div>
            <div className="tm_note tm_text_center tm_font_style_normal">
              <hr className="tm_mb15" />
              <TermsStyle5
                title="Terms And Condition" 
                subTitle=' Your use of the Website shall be deemed to constitute your understanding
                and approval of, and agreement <br className="tm_hide_print" />
                to be bound by, the Privacy Policy and you consent to the collection.'
              />
            </div>
            {/* .tm_note */}
          </div>
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
