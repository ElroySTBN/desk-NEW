import parser from 'html-react-parser'

export default function InvoiceToPayToStyle6({title, company, address, name, phone, email, destination}) {
    return (
        <div>
            <p className="tm_mb5">
                <b className="tm_primary_color">{`${title ? title + ':' : ''}`}</b>
            </p>
            <ul>
                <li>
                    <span>Company Name: </span>
                    <span className="tm_primary_color">{company}</span>
                </li>
                <li>
                    <span>Address: </span>
                    <span className="tm_primary_color">{parser(address)}</span>
                </li>
                <li>
                    <span>Contact Name: </span>
                    <span className="tm_primary_color">{name}</span>
                </li>
                <li>
                    <span>Phone Number: </span>
                    <span className="tm_primary_color">{phone}</span>
                </li>
                <li>
                    <span>Email: </span>
                    <span className="tm_primary_color">{email}</span>
                </li>
                <li>
                    <span>Country of Destination: </span>
                    <span className="tm_primary_color">{destination}</span>
                </li>
            </ul>
        </div>
    )
}
