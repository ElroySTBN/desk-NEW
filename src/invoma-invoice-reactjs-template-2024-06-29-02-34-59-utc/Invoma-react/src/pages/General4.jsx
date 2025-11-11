import { useRef } from "react";
import SubTotalStyle2 from "../components/subTotal/SubTotalStyle2";
import Signature from "../components/widget/Signature";
import TableStyle2 from "../components/table/TableStyle2";
import InvoiceToPayToStyle2 from "../components/invoiceToPayTo/InvoiceToPayToStyle2";
import InvoiceInfoStyle4 from "../components/invoiceInfo/InvoiceInfoStyle4";
import HeaderStyle4 from "../components/header/HeaderStyle4";
import Buttons from "../components/buttons/Buttons";
import TitleAndSubTitle from "../components/widget/TitleAndSubTitle";
import Footer from "../components/footer/Footer";
import { pageTitle } from "../helper/helper";


const headerData = [
  {
    icon : '/images/envolop.svg',
    subTitle : 'support@gmail.com <br/> career@gmail.com'
  },
  {
    icon : '/images/phone.svg',
    subTitle : '+99-131-124-567 <br/> Monday to Friday'
  },
  {
    icon : '/images/location.svg',
    subTitle : '9 Paul Street, London <br /> England EC2A 4NE'
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
    qty: '2', 
  },
]

export default function General4() {
  pageTitle('General 4');
  // download page
  const invoicePage = useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const discountPersent = 5;
  const discountAmount = discountPersent != 0 ? subTotal * discountPersent / 100 : '';
  const taxPersent = 5;
  const taxAmount = (subTotal - discountAmount) * taxPersent / 100;
  const grandTotal = (subTotal - discountAmount) + taxAmount;

  return (
    <>
      <div className="tm_invoice tm_style2 tm_type1 tm_accent_border" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <HeaderStyle4
            logo='/images/logo_white.svg'
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
            <InvoiceInfoStyle4
              title='Invoice'
              id='#LL93784'
              grandTotal={grandTotal}
            />
          </div>
          <div className="tm_table tm_style1">
            <div className="tm_round_border">
              <div className="tm_table_responsive">
                <TableStyle2 varient='tm_table_style_3' data={tableData} />
              </div>
            </div>
            <div className="tm_invoice_footer tm_mb15 tm_m0_md">
              <div className="tm_left_footer">
                <div className="tm_mb10 tm_m0_md" />
                <TitleAndSubTitle
                  title='Paypal & Stripe:'
                  subTitle='invoma@gmail.com'
                />
                <TitleAndSubTitle
                  title='Card Payment:'
                  subTitle='Visa, Master Card, American Axpress'
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
          <Footer
            title='Thank you for your business.'
            logo='/images/logo.svg'
            termsTitle='Terms & Condition'
            termsSubTitle='IInvoice was created on a computer and is valid without the signature and seal.'
          />
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
