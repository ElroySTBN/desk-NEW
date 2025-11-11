import parser from "html-react-parser";

interface InvoiceToPayToProps {
  title: string;
  subTitle: string;
  varient?: string;
}

export default function InvoiceToPayTo({ title, subTitle, varient }: InvoiceToPayToProps) {
  return (
    <div className={varient || ""}>
      <p className="tm_mb2">
        <b className="tm_primary_color">{parser(title)}:</b>
      </p>
      <p>{parser(subTitle)}</p>
    </div>
  );
}

