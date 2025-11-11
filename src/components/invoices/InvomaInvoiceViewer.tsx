import { useRef } from "react";
import Header from "./invoma/Header";
import InvoiceInfo from "./invoma/InvoiceInfo";
import InvoiceToPayTo from "./invoma/InvoiceToPayTo";
import Table from "./invoma/Table";
import SubTotal from "./invoma/SubTotal";
import PaymentInfo from "./invoma/PaymentInfo";
import Terms from "./invoma/Terms";
import Buttons from "./invoma/Buttons";
import "./invoma/invoma-styles.css";

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  clientName: string;
  clientCompany?: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  companyName: string;
  companyAddress: string;
  companyEmail?: string;
  companyPhone?: string;
  items: Array<{
    item: string;
    desc: string;
    price: number;
    qty: number;
  }>;
  tvaRate: number;
  terms?: string[];
}

interface InvomaInvoiceViewerProps {
  data: InvoiceData;
  logoUrl?: string;
  onDownload?: (pdfBlob: Blob) => void;
}

export default function InvomaInvoiceViewer({ data, logoUrl, onDownload }: InvomaInvoiceViewerProps) {
  const invoicePage = useRef<HTMLDivElement>(null);

  // Calculate totals
  const subTotal = data.items.reduce((total, item) => total + item.price * item.qty, 0);
  const taxAmount = subTotal * (data.tvaRate / 100);
  const grandTotal = subTotal + taxAmount;

  // Format date
  const formattedDate = new Date(data.date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Build client address string
  const clientAddressString = [
    data.clientName,
    data.clientCompany,
    data.clientAddress,
    data.clientEmail,
    data.clientPhone,
  ]
    .filter(Boolean)
    .join("<br />");

  // Build company address string
  const companyAddressString = [
    data.companyName,
    data.companyAddress,
    data.companyEmail,
    data.companyPhone,
  ]
    .filter(Boolean)
    .join("<br />");

  return (
    <>
      <div className="tm_invoice tm_style1" id="tm_download_section" ref={invoicePage}>
        <div className="tm_invoice_in">
          <Header logo={logoUrl} title="Invoice" />
          <InvoiceInfo id={data.invoiceNumber} date={formattedDate} />
          <div className="tm_invoice_head tm_mb10">
            <InvoiceToPayTo
              title="Invoice To"
              subTitle={clientAddressString}
              varient="tm_invoice_left"
            />
            <InvoiceToPayTo
              title="Pay To"
              subTitle={companyAddressString}
              varient="tm_invoice_right tm_text_right"
            />
          </div>
          <div className="tm_table tm_style1 tm_mb30">
            <div className="tm_round_border">
              <div className="tm_table_responsive">
                <Table data={data.items} itemCount={true} />
              </div>
            </div>
            <div className="tm_invoice_footer">
              <PaymentInfo
                varient="tm_left_footer"
                title="Payment Info"
                amount={grandTotal}
              />
              <div className="tm_right_footer">
                <SubTotal
                  subTotal={subTotal}
                  taxPersent={data.tvaRate}
                  taxAmount={taxAmount}
                  grandTotal={grandTotal}
                  borderBtm={true}
                />
              </div>
            </div>
          </div>
          {data.terms && data.terms.length > 0 && (
            <Terms
              varient="tm_round_border"
              title="Terms & Conditions:"
              data={data.terms}
            />
          )}
        </div>
      </div>
      <Buttons invoicePage={invoicePage} />
    </>
  );
}

