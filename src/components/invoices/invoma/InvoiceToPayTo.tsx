interface InvoiceToPayToProps {
  title: string;
  subTitle: string;
  varient?: string;
}

export default function InvoiceToPayTo({ title, subTitle, varient }: InvoiceToPayToProps) {
  // Convert HTML string to React elements (simple version for <br /> tags)
  const renderHtml = (html: string) => {
    return html.split("<br />").map((line, index, array) => (
      <span key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className={varient || ""}>
      <p className="tm_mb2">
        <b className="tm_primary_color">{title}:</b>
      </p>
      <p>{renderHtml(subTitle)}</p>
    </div>
  );
}

