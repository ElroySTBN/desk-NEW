import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { currentDate5, pageTitle } from "../helper/helper";
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo";
import TableStyle11 from "../components/table/TableStyle11";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import SubTotalStyle8 from "../components/subTotal/SubTotalStyle8";
import TermsStyle5 from "../components/termsAndConditions/TermsStyle5";

const tableData = [
  {
    item: 'Colombia Dark Roast',
    desc: 'High quality Ray-ban Wayfarer Sunglasses',
    price: '50',
    qty: '1',
  },
  {
    item: 'Swiss Water Decaf',
    desc: 'Half Sleeve Casual Shirt for Woman shat',
    price: '40',
    qty: '4',
  },
  {
    item: 'Double Espresso',
    desc: 'Realme c25s - 4gb / 128gb 6000mah battery',
    price: '60',
    qty: '3',
  },
  {
    item: 'Coffee Mug',
    desc: 'Uiisii HM13 Wired Noise Cancelling Heavy Bass Music In-Ear with Mic Earphone',
    price: '25',
    qty: '2',
  },
]

export default function CoffeeShopInvoice() {
  pageTitle('Coffee Shop');
  const invoicePage = useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const discountPersent = 10;
  const discountAmount = discountPersent != 0 ? subTotal * discountPersent / 100 : '';
  const taxPersent = 10;
  const taxAmount = (subTotal - discountAmount) * taxPersent / 100;
  const grandTotal = (subTotal - discountAmount) + taxAmount;

  return (
    <>
      <div className="tm_invoice tm_style1" id="tm_download_section" ref={invoicePage}>
        <div className="tm_coffee_shop_img">
          <img src="/images/coffy_shop_img.svg" alt="" />
        </div>
        <div className="tm_invoice_in">
          <div className="tm_invoice_head tm_align_center">
            <div className="tm_invoice_left">
              <div className="tm_logo">
                <img src="/images/logo.svg" alt="Logo" />
              </div>
            </div>
            <div className="tm_invoice_right tm_text_right">
              <div className="tm_primary_color tm_f50 tm_text_uppercase">Invoice</div>
            </div>
          </div>
          <div className="tm_invoice_info tm_mb20">
            <div className="tm_invoice_seperator" />
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
              title='Invoice To'
              subTitle='Lowell H. Dominguez 84 <br/> Spilman Street, London <br /> England EC2A 4NE <br /> demo@gmail.com'
              varient='tm_invoice_left'
            />
            <InvoiceToPayTo
              title='Pay To'
              subTitle='Laralink Ltd <br /> 86-90 Paul Street, London <br /> England EC2A 4NE <br /> demo@gmail.com'
              varient='tm_invoice_right tm_text_right'
            />
          </div>
          <div className="tm_table tm_style1 tm_mb30 tm_m0_md">
            <div className="tm_radius_0">
              <div className="tm_table_responsive">
                <TableStyle11 data={tableData} />
              </div>
            </div>
            <div className="tm_invoice_footer">
              <PaymentInfo
                varient='tm_left_footer tm_padd_left_15_md'
                title='Payment Info'
                cardNumber="236***********928"
                cardType="Cradit Card"
                amount={grandTotal}
              />
              <div className="tm_right_footer">
                <SubTotalStyle8
                  subTotal={subTotal}
                  taxPersent={taxPersent}
                  taxAmount={taxAmount}
                  discountPersent={discountPersent}
                  discountAmount={discountAmount}
                  grandTotal={grandTotal}
                />
              </div>
            </div>
          </div>
          <hr className="tm_mb20" />
          <TermsStyle5
            title="Terms And Condition" 
            subTitle=' Your use of the Website shall be deemed to constitute your understanding
            and approval of, and agreement <br className="tm_hide_print" />
            to be bound by, the Privacy Policy and you consent to the collection.'
          />
        </div>
      </div>
      <Buttons invoicePage={invoicePage} />
    </>
  )
}
