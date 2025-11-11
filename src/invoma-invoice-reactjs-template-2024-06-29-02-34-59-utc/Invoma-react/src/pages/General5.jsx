import { useRef } from "react";
import Buttons from "../components/buttons/Buttons";
import InvoiceInfoStyle5 from "../components/invoiceInfo/InvoiceInfoStyle5";
import HeaderStyle5 from "../components/header/HeaderStyle5";
import InvoiceToPayTo from "../components/invoiceToPayTo/InvoiceToPayTo";
import DueAmount from "../components/widget/DueAmount";
import TableStyle4 from "../components/table/TableStyle4";
import SubTotalStyle4 from "../components/subTotal/SubTotalStyle4";
import TermsStyle4 from "../components/termsAndConditions/TermsStyle4";
import { pageTitle } from "../helper/helper";


const headerData = [
  {
    subTitle : '+01 983 345 213 <br /> email@company.com'
  },
  {
    subTitle : '9 Paul Street, London <br /> England EC2A 4NE'
  },
  {
    subTitle : 'Visite Our site:<br/> www.company.com'
  },
]

const tableData = [
  {
    item: 'Website Design ',
    desc: 'Six web page designs and three times revision',
    price: '400',
    qty: '3',
  },
  {
    item: 'Web Development',
    desc: 'Convert pixel-perfect frontend and make it dynamic',
    price: '400',
    qty: '4', 
  },
  {
    item: 'App Development',
    desc: 'Android And Ios Application Development',
    price: '450',
    qty: '3', 
  },
  {
    item: 'Digital Marketing',
    desc: 'Facebook, Youtube and Google Marketing',
    price: '500',
    qty: '10', 
  },
]

export default function General5() {
  pageTitle('General 5');
  // download page
  const invoicePage = useRef();


  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const taxPersent = 10;
  const taxAmount = subTotal * taxPersent / 100;
  const grandTotal = subTotal + taxAmount;

  return (
    <>
      <div className="tm_invoice tm_style1 tm_radius_0" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <InvoiceInfoStyle5
            title='Invoice'
            id='#LL48754'
          />
          <HeaderStyle5 
            logo='/images/logo_white.svg'
            data={headerData}
          />
          <div className="tm_invoice_head tm_mb10">
            <InvoiceToPayTo
              varient='tm_invoice_left'
              title='Bill To'
              subTitle='Lowell H. Dominguez <br />
              84 Spilman Street, London <br />
              +01 654 372 234
              <br />
              lowell@gmail.com'
            />
            <DueAmount
              due={grandTotal}
              cardType='Creadit Card'
            />
          </div>
          <div className="tm_table tm_style1 tm_mb40">
            <div className="tm_round_border tm_radius_0">
              <div className="tm_table_responsive">
                <TableStyle4 data={tableData}/>
              </div>
            </div>
            <div className="tm_invoice_footer">
              <div className="tm_left_footer tm_mobile_hide"></div>
              <div className="tm_right_footer">
                <SubTotalStyle4 
                  subTotal={subTotal}
                  taxPersent={taxPersent}
                  taxAmount={taxAmount}
                  grandTotal={grandTotal}
                />
              </div>
            </div>
          </div>
          <TermsStyle4 
            title='Terms and conditions'
            subTitle="Delivery dates are not guaranteed and Seller has no liability for
            damages that may be incurred due to any delay in shipment of goods
            hereunder. Taxes are excluded unless otherwise stated."
          />
        </div>
      </div>
      <Buttons invoicePage={invoicePage} />
    </>
  )
}
