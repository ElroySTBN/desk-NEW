import InvoiceInfoStyle7 from "../components/invoiceInfo/InvoiceInfoStyle7";
import InvoiceToPayToStyle4 from "../components/invoiceToPayTo/InvoiceToPayToStyle4";
import { useRef } from "react";
import TableStyle6 from "../components/table/TableStyle6";
import SubTotalStyle6 from "../components/subTotal/SubTotalStyle6";
import TermsStyle4 from "../components/termsAndConditions/TermsStyle4";
import Buttons from "../components/buttons/Buttons";
import HeaderStyle7 from "../components/header/HeaderStyle7";
import { pageTitle } from "../helper/helper";



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
    qty: '1', 
  },
  {
    item: 'Digital Marketing',
    desc: 'Facebook, Youtube and Google Marketing',
    price: '500',
    qty: '2', 
  },
]

export default function General8() {
  pageTitle('General 8');
  // download page
  const invoicePage = useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const taxPersent = 5;
  const taxAmount = subTotal * taxPersent / 100;
  const grandTotal = subTotal + taxAmount;

  return (
    <>
      <div className="tm_invoice tm_style1 tm_radius_0" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <InvoiceInfoStyle7 title='Invoice' id='#LL230912' />
          <HeaderStyle7 
            logo='/images/logo_accent.svg'
            contact='+01 983 345 213 <br />
            email@company.com <br />
            www.company.com'
            address='90 Paul Street, London <br />
            England EC2A 4NE <br />
            United Kingdom'
          />
          <InvoiceToPayToStyle4
            title='Bill To'
            address='Lowell H. Dominguez <br /> 84 Spilman Street, London <br /> CIF 675432098'
            contact='email@company.com <br /> +01 983 345 213 <br /> www.company.com'
            total={grandTotal}
            paymentMethod='Bank'
          />
          <div className="tm_table tm_style1 tm_mb40">
            <div className="tm_round_border tm_accent_border_20 tm_radius_0">
              <div className="tm_table_responsive">
                <TableStyle6 varient="tm_table_style_4" data={tableData}/>
              </div>
            </div>
            <div className="tm_invoice_footer">
              <div className="tm_left_footer tm_mobile_hide"></div>
              <div className="tm_right_footer">
                <SubTotalStyle6
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
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
