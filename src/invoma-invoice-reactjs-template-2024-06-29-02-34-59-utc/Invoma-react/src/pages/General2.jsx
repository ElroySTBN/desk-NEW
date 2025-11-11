import { useRef } from "react";
import SubTotalStyle2 from "../components/subTotal/SubTotalStyle2";
import TermsStyle2 from "../components/termsAndConditions/TermsStyle2";
import Signature from "../components/widget/Signature";
import TableStyle2 from "../components/table/TableStyle2";
import Note from "../components/widget/Note";
import PaymentInfoStyle2 from "../components/paymentInfo/PaymentInfoStyle2";
import InvoiceInfoStyle2 from "../components/invoiceInfo/InvoiceInfoStyle2";
import Buttons from "../components/buttons/Buttons";
import InvoiceToPayToStyle2 from "../components/invoiceToPayTo/InvoiceToPayToStyle2";
import HeaderStyle2 from "../components/header/HeaderStyle2";
import { pageTitle } from "../helper/helper";


const headerData = [
  {
    title : 'Email',
    subTitle : 'support@gmail.com <br/> career@gmail.com'
  },
  {
    title : 'Phone',
    subTitle : '+99-131-124-567 <br/> Monday to Friday'
  },
  {
    title : 'Address',
    subTitle : '9 Paul Street, London <br /> England EC2A 4NE'
  },
]

const tableData = [
  {
    item: 'Website Design ',
    desc: 'Six web page designs and three times revision',
    price: '400',
    qty: '5', 
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
    qty: '5', 
  },
  {
    item: 'Digital Marketing',
    desc: 'Facebook, Youtube and Google Marketing',
    price: '500',
    qty: '10', 
  },
]

export default function General2() {
  pageTitle('General 2');
  // download page
  const invoicePage = useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const discountPersent = 10;
  const discountAmount = discountPersent != 0 ? subTotal * discountPersent / 100 : '';
  const taxPersent = 5;
  const taxAmount = (subTotal - discountAmount) * taxPersent / 100;
  const grandTotal = (subTotal - discountAmount) + taxAmount;

  return (
    <>
      <div className="tm_invoice tm_style2" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <HeaderStyle2
            logo='/images/logo.svg'
            data={headerData}
          />
          <div className="tm_invoice_info tm_mb10">
            <div className="tm_invoice_info_left">
              <InvoiceToPayToStyle2
                titleUp='Invoice To'
                title='Lowell H. Dominguez'
                subTitle='84 Spilman Street, London <br />
                United Kingdom. <br />
                lowell@gmail.com <br />
                +99-327-123-987'
              />
            </div>
            <div className="tm_invoice_info_right">
              <InvoiceInfoStyle2 
                title='Invoice'
                grandTotal={grandTotal}
                id='#LL93784'
                bg='tm_accent_bg'
                titleColor='tm_white_color'
                subTitleColor='tm_white_color_60'
              />
            </div>
          </div>
          <div className="tm_table tm_style1">
            <div className="tm_round_border">
              <div className="tm_table_responsive">
                <TableStyle2 varient='tm_table_style_2' data={tableData} />
              </div>
            </div>
            <div className="tm_invoice_footer tm_mb15 tm_m0_md">
              <div className="tm_left_footer">
                <PaymentInfoStyle2
                  title='Payment Info'
                  cardType='Cradit Card'
                  cardNumber='236***********928'
                />
                <Note 
                  title='Important Note:'
                  desc='Delivery dates are not guaranteed and Seller has <br />
                    no liability for damages that may be incurred <br />
                    due to any delay.
                  '
                />
              </div>
              <div className="tm_right_footer">
                <SubTotalStyle2
                  subTotal={subTotal}
                  discountAmount={discountAmount}
                  discountPersent={discountPersent}
                  taxPersent={taxPersent}
                  taxAmount={taxAmount}
                  grandTotal={grandTotal}
                  gtBg='tm_accent_bg'
                  gtColor='tm_white_color'
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
          <TermsStyle2 
            title='Terms and Conditions'
            subTitle='
            All claims relating to quantity or shipping errors shall be waived
            by Buyer unless made in writing to <br />
            Seller within thirty (30) days after delivery of goods to the
            address stated.'
          />
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
