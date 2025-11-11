import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { currentDate4, pageTitle } from "../helper/helper";
import TableStyle12 from "../components/table/TableStyle12";
import SubTotalStyle2 from "../components/subTotal/SubTotalStyle2";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import TermsStyle5 from "../components/termsAndConditions/TermsStyle5";
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo";

const tableData = [
  {
    item: 'House Rent',
    desc: '',
    price: '200',
    qty: '3',
  },
  {
    item: 'Service Charges',
    desc: '',
    price: '60',
    qty: '1',
  },
  {
    item: 'Community Charges',
    desc: '',
    price: '10',
    qty: '3',
  },
  {
    item: 'Well Fare Chare',
    desc: '',
    price: '5',
    qty: '2',
  },
]

export default function RealEstateInvoice() {
  pageTitle('Real Estate');
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
      <div className="tm_invoice tm_style2" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <div className="tm_invoice_content">
            <div className="tm_invoice_head tm_mb10 tm_border_none">
              <div className="tm_invoice_left">
                <div className="tm_logo">
                  <img src="/images/logo.svg" alt="Logo" />
                </div>
              </div>
              <div className="tm_invoice_right tm_text_right">
                <b className="tm_f30 tm_medium tm_primary_color">Invoice</b>
                <p className="tm_m0">
                  <b className="tm_medium tm_primary_color">Invoice No:</b> LL87265
                </p>
                <p className="tm_m0">
                  <b className="tm_medium tm_primary_color">Date:</b> {currentDate4()}
                </p>
              </div>
            </div>
            <div className="tm_grid_row tm_col_2 tm_invoice_info_in tm_round_border tm_mb30">
              <InvoiceToPayTo 
                varient='tm_border_right tm_border_none_sm'
                title='Invoice To'
                subTitle='Lowell H. Dominguez <br />
                84 Spilman Street, London <br />
                United Kingdom <br />
                lowell@gmail.com <br />
                +990 098 234 987'
              />
              <InvoiceToPayTo 
                title='Pay To'
                subTitle='Laralink Ltd <br />
                86-90 Paul Street, London
                <br />
                England EC2A 4NE <br />
                demo@gmail.com <br />
                +990 876 324 123'
              />
            </div>
            <div className="tm_table tm_style1">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <TableStyle12 data={tableData} />
                </div>
              </div>
              <div className="tm_invoice_footer tm_mb15">
                <PaymentInfo
                  varient='tm_left_footer'
                  title='Payment Info'
                  cardType='Cradit Card'
                  cardNumber='236***********928'
                  amount={grandTotal}
                  author="Lowell H. Dominguez"
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
          </div>
        </div>
      </div>
      <Buttons invoicePage={invoicePage} />
    </>
  )
}
