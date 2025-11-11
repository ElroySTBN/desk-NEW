import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import { currentDate5, pageTitle } from "../helper/helper";
import SubTotal from "../components/subTotal/SubTotal";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import Header from "../components/header/Header";
import InvoiceInfo from "../components/invoiceInfo/InvoiceInfo";
import TableStyle20 from "../components/table/TableStyle20";


const tableData = [
  {
    item: 'Semester Fee',
    desc: '28 March 2022',
    price: '70',
    qty: '5', 
  },
  {
    item: 'Exam Fee',
    desc: '28 March 2022',
    price: '110',
    qty: '4', 
  },
  {
    item: 'Transport Fee',
    desc: '28 March 2022',
    price: '45',
    qty: '3', 
  },
  {
    item: 'Hostel Fee',
    desc: '28 March 2022',
    price: '30',
    qty: '1', 
  },
]


export default function StudentBilling() {
  pageTitle('Student Billing');
  const invoicePage= useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + parseFloat(item.price), 0);
  const taxPersent = 10;
  const taxAmount = subTotal * taxPersent / 100;
  const grandTotal = (subTotal + taxAmount);
  const paidAmount = 100;
  const dueAmount = grandTotal - paidAmount;
  
  return (
    <>
      <div className="tm_invoice tm_style1" id="tm_download_section"  ref={invoicePage}>
        <div className="tm_invoice_in">
          <Header
            logo='/images/logo.svg'
            title='Invoice'
          />
          <InvoiceInfo
            id='LL93784'
          />
          <div className="tm_invoice_head tm_mb10">
            <div className="tm_invoice_left">
              <p className="tm_mb2 tm_f16">
                <b className="tm_primary_color tm_text_uppercase">University Name</b>
              </p>
              <p>
                84 Spilman Street, London <br />
                United Kingdom <br />
                lowell@gmail.com <br />
                +99 098 281 123
              </p>
            </div>
            <div className="tm_invoice_right">
              <div className="tm_grid_row tm_col_3  tm_col_2_sm tm_invoice_table tm_round_border">
                <div>
                  <p className="tm_m0">Student Name:</p>
                  <b className="tm_primary_color">Jhon Doe</b>
                </div>
                <div>
                  <p className="tm_m0">Student ID:</p>
                  <b className="tm_primary_color">LL192734</b>
                </div>
                <div>
                  <p className="tm_m0">Term:</p>
                  <b className="tm_primary_color">Winter</b>
                </div>
                <div>
                  <p className="tm_m0">Balance Due:</p>
                  <b className="tm_primary_color">${dueAmount.toFixed(2)}</b>
                </div>
                <div>
                  <p className="tm_m0">Due Date:</p>
                  <b className="tm_primary_color">28 March 2022</b>
                </div>
                <div>
                  <p className="tm_m0">Statement For:</p>
                  <b className="tm_primary_color">2022 Spring</b>
                </div>
              </div>
            </div>
          </div>
          <div className="tm_table tm_style1">
            <div className="tm_round_border">
              <div className="tm_table_responsive">
                <TableStyle20  data={tableData}/>
              </div>
            </div>
            <div className="tm_invoice_footer">
              <PaymentInfo
                varient='tm_left_footer'
                title='Payment Info'
                cardType='Cradit Card'
                cardNumber='236***********928'
                amount={paidAmount}
                author=' Lowell H. Dominguez'
              />
              <div className="tm_right_footer">
                <SubTotal
                  subTotal={subTotal} 
                  taxPersent={taxPersent} 
                  taxAmount={taxAmount} 
                  grandTotal={grandTotal}
                />
              </div>
            </div>
          </div>
          <div className="tm_note tm_text_center tm_m0_md">
            <p className="tm_m0">
              Invoice was created on a computer and is valid without the signature and
              seal.
            </p>
          </div>
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
