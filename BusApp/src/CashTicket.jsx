import React from 'react';
import { useLocation } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MyTcket from './MyTcket';
const CashTicket = () => {
  
  const location = useLocation();
  const {ticket, employee, ticket_number}= location.state || {};
  const { name, email, phone, amount, from, to, date, time, seats } = ticket || {};

console.log(ticket)

 // Disable the back button
 window.history.pushState(null, document.title, window.location.href);
 window.addEventListener('popstate', function (event) {
   window.history.pushState(null, document.title, window.location.href);
 });

  return (
    <div className="ticketsearch">
      
      <h2>Ticket Details</h2>
      <p>Name: {name}</p>
      <p>Email: {email}</p>
      <p>Phone: {phone}</p>
      <p>Seats: {seats}</p>
      <p>Amount: {amount}</p>
      <p>From: {from}</p>
      <p>To: {to}</p>
      <p>Date: {date}</p>
      <p>Time: {time ? new Date(time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          }) : 'N/A'}</p>
      <p>Ticket Number: {ticket_number}</p>
      <p>payment method: Cash</p>
      {employee && <p>Booked by: {employee}</p>}

      <div>
                <button>
                  <PDFDownloadLink
                    document={<MyTcket paymentDetails={ticket} ticketNumber={ticket_number} employee={employee}/>}
                    fileName="ticket.pdf"
                  >
                    {({ blob, url, loading, error }) =>
                      loading ? 'Loading...' : error ? 'Error occurred while generating PDF' : 'Download Ticket as PDF'
                    }
                  </PDFDownloadLink>
                </button>
              </div>
    </div>
  );
};

export default CashTicket;
