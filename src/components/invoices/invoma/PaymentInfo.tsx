import parser from "html-react-parser";

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
  return (
    <div className={varient || ""}>
      <p className="tm_mb2">
        <b className="tm_primary_color">{parser(title)}:</b>
      </p>
      {author && <p className="tm_mb0">{author}</p>}
      {cardType && cardNumber && (
        <p className="tm_mb0">
          {cardType} - {parser(cardNumber)}
        </p>
      )}
      <p className="tm_mb0">Amount: {amount.toFixed(2)} €</p>
    </div>
  );
}

