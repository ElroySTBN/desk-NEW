interface PaymentInfoProps {
  varient?: string;
  title: string;
  cardType?: string;
  cardNumber?: string;
  amount: number;
  author?: string;
}

export default function PaymentInfo({
  varient,
  title,
  cardType,
  cardNumber,
  amount,
  author,
}: PaymentInfoProps) {
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
      {author && <p className="tm_mb0">{author}</p>}
      {cardType && cardNumber && (
        <p className="tm_mb0">
          {cardType} - {renderHtml(cardNumber)}
        </p>
      )}
      <p className="tm_mb0">Amount: {amount.toFixed(2)} €</p>
    </div>
  );
}

