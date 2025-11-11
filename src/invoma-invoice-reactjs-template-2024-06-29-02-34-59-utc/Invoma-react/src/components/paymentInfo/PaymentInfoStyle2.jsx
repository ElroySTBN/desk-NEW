
export default function PaymentInfoStyle2({title, cardType, cardNumber}) {
  return (
    <div className="tm_card_note tm_ternary_bg tm_white_color">
      <b>{title}: </b>{cardType} - {cardNumber}
    </div>
  )
}
