interface InvoiceInfoProps {
  id: string;
  date: string;
}

export default function InvoiceInfo({ id, date }: InvoiceInfoProps) {
  return (
    <div className="tm_invoice_info tm_mb20">
      <div className="tm_invoice_seperator tm_gray_bg" />
      <div className="tm_invoice_info_list">
        <p className="tm_invoice_number tm_m0">
          Invoice No: <b className="tm_primary_color">#{id}</b>
        </p>
        <p className="tm_invoice_date tm_m0">
          Date: <b className="tm_primary_color">{date}</b>
        </p>
      </div>
    </div>
  );
}

