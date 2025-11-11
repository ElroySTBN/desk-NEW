import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import Header from "../components/header/Header";
import InvoiceInfo from "../components/invoiceInfo/InvoiceInfo";
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo";
import Table from "../components/table/Table";
import SubTotalStyle7 from "../components/subTotal/SubTotalStyle7";
import TermsStyle5 from "../components/termsAndConditions/TermsStyle5";
import { pageTitle } from "../helper/helper";

const tableData = [
  {
    item: 'Men Sunglasses',
    desc: 'High quality Ray-ban Wayfarer Sunglasses',
    price: '300',
    qty: '1', 
  },
  {
    item: 'Half Shirt',
    desc: 'Half Sleeve Casual Shirt for Woman shat',
    price: '600',
    qty: '4', 
  },
  {
    item: 'In-Ear Headphone',
    desc: 'Realme c25s - 4gb / 128gb 6000mah battery',
    price: '200',
    qty: '3', 
  },
  {
    item: 'Digital Marketing',
    desc: 'Uiisii HM13 Wired Noise Cancelling Heavy Bass Music In-Ear with Mic Earphone',
    price: '100',
    qty: '2', 
  },
]

export default function EcommerceInvoice() {
  pageTitle('Ecommerce');
  const invoicePage = useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const discountPersent = 10;
  const discountAmount = discountPersent != 0 ? subTotal * discountPersent / 100 : '';
  const taxPersent = 15;
  const taxAmount = (subTotal - discountAmount) * taxPersent / 100;
  const grandTotal = (subTotal - discountAmount) + taxAmount;
  return (
    <>
      <div className="tm_invoice tm_style1" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <Header
            logo='/images/logo.svg'
            title='Invoice'
          />
          <InvoiceInfo
            id='LL93784'
          />
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
          <div className="tm_table tm_style1">
            <div className="tm_round_border tm_radius_0">
              <div className="tm_table_responsive">
                <Table data={tableData} />
              </div>
            </div>
            <div className="tm_invoice_footer tm_border_left tm_border_left_none_md">
              <PaymentInfo 
                varient='tm_left_footer tm_padd_left_15_md'
                title='Payment Info'
                cardNumber="236***********928"
                cardType="Cradit Card"
                amount={grandTotal}
              />
              <div className="tm_right_footer">
                <SubTotalStyle7
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
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
