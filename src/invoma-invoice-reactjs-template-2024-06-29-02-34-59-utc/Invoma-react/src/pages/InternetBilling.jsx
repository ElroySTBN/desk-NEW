import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { currentDate5, pageTitle } from "../helper/helper";
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import SubTotalStyle10 from "../components/subTotal/SubTotalStyle10";
import TableStyle17 from "../components/table/TableStyle17";
import Signature from "../components/widget/Signature";

const tableData = [
  {
    item: 'Monthly bandwidth usages - 230GB',
    desc: '01 Jun 2024 To 31 Jun 2024',
    price: '50',
    qty: '3',
  },
  {
    item: 'IP TV',
    desc: '01 Jun 2024 To 31 Jun 2024',
    price: '50',
    qty: '1',
  },
  {
    item: 'Equpment rental',
    desc: '01 Jun 2024 To 31 Jun 2024',
    price: '30',
    qty: '2',
  },
]

// calculation
const serviceCost = 30;
const subTotal = tableData.reduce((total, item) => total + parseFloat(item.price), 0) +  serviceCost;
const discountPersent = 25;
const discountAmount = discountPersent != 0 ? subTotal * discountPersent / 100 : '';
const grandTotal = subTotal - discountAmount;

export default function InternetBilling() {
  pageTitle('Internet Billing');
  const invoicePage= useRef();
  
  return (
    <>
      <div className="tm_invoice tm_style1" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <div className="tm_invoice_head tm_align_center tm_mb20">
            <div className="tm_invoice_left">
              Invoice Date: <b className="tm_primary_color">{currentDate5()}</b> <br />
              Invoice No: <b className="tm_primary_color">LL93784</b> <br />
              Client ID: <b className="tm_primary_color">2314871</b>
            </div>
            <div className="tm_invoice_right tm_text_right">
              <div className="tm_logo tm_size1">
                <img src="/images/logo.svg" alt="Logo" />
              </div>
            </div>
          </div>
          <hr className="tm_mb20" />
          <div className="tm_invoice_head tm_mb10">
            <InvoiceToPayTo
              varient='tm_invoice_left' 
              title='Invoice To'
              subTitle=' Lowell H. Dominguez <br />
              84 Spilman Street, London <br />
              United Kingdom <br />
              lowell@gmail.com'
            />
            <InvoiceToPayTo
              varient='tm_invoice_right tm_text_right' 
              title='Invoma Ltd'
              subTitle='Laralink Ltd <br />
              86-90 Paul Street, London
              <br />
              England EC2A 4NE <br />
              demo@gmail.com'
            />
          </div>
          <div className="tm_table tm_style1">
            <div className="tm_table_responsive">
              <TableStyle17 data={tableData} serviceCost={serviceCost}/>
            </div>
            <div className="tm_invoice_footer tm_border_top tm_mb15 tm_m0_md">
              <PaymentInfo
                varient='tm_left_footer tm_padd_left_15_md'
                title='Pay By'
                cardType='Credit Card'
                cardNumber='236***********928'
                amount={grandTotal}
                author='Lowell H. Domingez'
              />
              <div className="tm_right_footer">
                <SubTotalStyle10 
                  subTotal={subTotal} 
                  discountPersent={discountPersent} 
                  discountAmount={discountAmount} 
                  grandTotal={grandTotal}
                  borderBtm={true}
                />
              </div>
            </div>
            <div className="tm_invoice_footer tm_type1">
              <div className="tm_left_footer" />
              <div className="tm_right_footer">
                <Signature 
                  imgUrl='/images/sign.svg'
                  name='Jack Donate'
                  designation='Accounts Manager'
                />
              </div>
            </div>
          </div>
          <div className="tm_note tm_text_center">
            <p className="tm_m0 tm_primary_color">
              Thank you for using our service. Contact the helpline (109283) for any
              problem.
            </p>
          </div>
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
