import { useRef } from "react";
import Signature from "../components/widget/Signature";
import Buttons from "../components/buttons/Buttons";
import Footer from "../components/footer/Footer";
import PaymentInfo from "../components/paymentInfo/PaymentInfo";
import SubTotalStyle5 from "../components/subTotal/SubTotalStyle5";
import TableStyle5 from "../components/table/TableStyle5";
import HeaderStyle6 from "../components/header/HeaderStyle6";
import InvoiceInfoStyle6 from "../components/invoiceInfo/InvoiceInfoStyle6";
import InvoiceToPayToStyle3 from "../components/invoiceToPayTo/InvoiceToPayToStyle3";
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

export default function General7() {
  pageTitle('General 7');
  // download page
  const invoicePage = useRef();

  // calculation
  const subTotal = tableData.reduce((total, item) => total + item.price * item.qty, 0);
  const discountPersent = 15;
  const discountAmount = discountPersent != 0 ? subTotal * discountPersent / 100 : '';
  const taxPersent = 0;
  const taxAmount = (subTotal - discountAmount) * taxPersent / 100;
  const grandTotal = (subTotal - discountAmount) + taxAmount;

  return (
    <>
      <div className="tm_invoice tm_style2 tm_type1 tm_accent_border tm_radius_0 tm_small_border" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <HeaderStyle6
            logo="/images/logo_accent.svg"
            data={headerData}
          />
          <InvoiceInfoStyle6
            id='#LL93784'
            total={grandTotal}
          />
          <InvoiceToPayToStyle3
            title='Invoice To'
            name='Lowell H.Dominguez'
            email='demo@gmail.com'
            phone='+99-098-234-984'
            address='84 Spilman Street, London, United Kingdom'
          />
          <div className="tm_table tm_style1">
            <div className="tm_border tm_accent_border_20">
              <div className="tm_table_responsive">
                <TableStyle5  data={tableData} />
              </div>
            </div>
            <div className="tm_invoice_footer tm_mb15 tm_m0_md">
              <PaymentInfo
                varient='tm_left_footer'
                title='Payment Info'
                author='John Doe'
                cardType='Cradit Card'
                cardNumber='236***********928'
                amount={grandTotal}
              />
              <div className="tm_right_footer">
                <SubTotalStyle5
                  subTotal={subTotal}
                  discountAmount={discountAmount}
                  discountPersent={discountPersent}
                  taxPersent={taxPersent}
                  taxAmount={taxAmount}
                  grandTotal={grandTotal}
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
            logo='/images/logo_accent.svg'
            termsTitle='Terms & Condition'
            termsSubTitle='IInvoice was created on a computer and is valid without the signature and seal.'
          />
        </div>
      </div>
      <Buttons invoicePage={invoicePage}/>
    </>
  )
}
