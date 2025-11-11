import { useRef } from "react";
import Terms from "../components/termsAndConditions/Terms";
import Buttons from "../components/buttons/Buttons";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import DueAmountStyle2 from "../components/widget/DueAmountStyle2";
import TableStyle8 from "../components/table/TableStyle8";
import HeaderStyle9 from "../components/header/HeaderStyle9";
import InvoiceToPayToStyle5 from "../components/invoiceToPayTo/InvoiceToPayToStyle5";
import InvoiceInfoStyle10 from "../components/invoiceInfo/InvoiceInfoStyle10";
import { pageTitle } from "../helper/helper";

const tableData = [
  {
    item: 'Laptop',
    discount: '10',
    price: '400',
    qty: '3', 
  },
  {
    item: 'Smartphone',
    discount: '15',
    price: '400',
    qty: '2', 
  },
  {
    item: 'Headphones',
    discount: '0',
    price: '350',
    qty: '1', 
  },
  {
    item: 'Backpack',
    discount: '5',
    price: '500',
    qty: '2', 
  },
]

const termsAndCondition = [
  'All claims relating to quantity or shipping errors shall be waived by Buyer unless made in writing to Seller within thirty (30) days after delivery of goods to the address stated.',
  'Delivery dates are not guaranteed and Seller has no liability for damages that may be incurred due to any delay in shipment of goods hereunder. Taxes are excluded unless otherwise stated.'
]


export default function General11() {
  pageTitle('General 11');

  // download page
  const invoicePage = useRef();

  // calculation
  // const totalAmount = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const totalAmount = tableData.reduce((total, item) => total + ((item.price * item.qty)-((item.price * item.qty * item.discount)/100)), 0);
  
  const paidAmount = 1000;
  const dueAmount = totalAmount - paidAmount;

  return (
    <>
      <div className="tm_invoice tm_style3" id="tm_download_section" ref={invoicePage}>
          <div className="tm_invoice_in">
            <HeaderStyle9
              logo="/images/logo_white.svg"
              title='Invoice'
              subTitle='Laralink Ltd <br />
              86-90 Paul Street, London
              <br />
              Phone: +990 9866 334 2134 <br />
              Email: demo@gmail.com'
            />
            <div className="tm_invoice_info">
              <InvoiceToPayToStyle5
                title='Invoice To'
                subTitle=' Lowell H. Dominguez <br />
                84 Spilman Street, London <br />
                lowell@gmail.com <br />
                +990 9879 654 0976
              '
              />
              <InvoiceInfoStyle10
                id='#LL93784'
              />
            </div>
            <div className="tm_invoice_details">
              <div className="tm_table tm_style1 tm_mb30">
                <div className="tm_border">
                  <div className="tm_table_responsive">
                    <TableStyle8
                      varient='tm_gray_bg'
                      data={tableData}
                    />
                  </div>
                </div>
                <div className="tm_invoice_footer">
                  <PaymentInfo 
                    varient='tm_left_footer'
                    title='Payment Info'
                    cardType='Cradit Card'
                    cardNumber='236***********928'
                    amount={paidAmount}
                  />
                  <div className="tm_right_footer">
                    <DueAmountStyle2
                      totalAmount={totalAmount}
                      paidAmount={paidAmount}
                      dueAmount={dueAmount}
                    />
                  </div>
                </div>
              </div>
              <Terms 
                varient='tm_gray_bg'
                title='Terms And Conditions'
                data={termsAndCondition}
              />
            </div>
          </div>
      </div>
      <Buttons invoicePage={invoicePage} />
    </>
  )
}
