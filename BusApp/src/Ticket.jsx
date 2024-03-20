import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MyTcket from './MyTcket';
import { Map } from './Map';
import { parse, differenceInSeconds } from 'date-fns';

const Ticket = () => {
  const location = useLocation();
  const { paymentDetails, ticketNumber, employee } = location.state || {};
  const selectedSeats = paymentDetails.seats || [];
  const [busPosition, setBusPosition] = useState(null);
  const [departureTime, setDepartureTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const [busDeparted, setBusDeparted] = useState(false);

  useEffect(() => {
    const departureTimeStr = paymentDetails.time;
    const departureTime = parse(departureTimeStr, 'HH:mm', new Date());

    setDepartureTime(departureTime);

    const currentTime = new Date();
    const timeDiff = differenceInSeconds(departureTime, currentTime);
    setTimeRemaining(Math.max(timeDiff, 0));

    setBusPosition(paymentDetails.from);
  }, [paymentDetails.time, paymentDetails.from]);

  useEffect(() => {
    if (departureTime && timeRemaining > 0) {
      return;
    }

    const currentTime = new Date();
    const timeDiff = differenceInSeconds(departureTime, currentTime);
    setTimeRemaining(Math.max(timeDiff, 0));
  }, [departureTime, timeRemaining]);

  useEffect(() => {
    const departureDateStr = paymentDetails.date;
    const departureTimeStr = paymentDetails.time;
    const departureDateTime = parse(departureDateStr + ' ' + departureTimeStr, 'yyyy-MM-dd HH:mm', new Date());

    setDepartureTime(departureDateTime);

    const currentTime = new Date();
    const timeDiff = differenceInSeconds(departureDateTime, currentTime);
    setTimeRemaining(Math.max(timeDiff, 0));

    setBusPosition(paymentDetails.from);
  }, [paymentDetails.date, paymentDetails.time, paymentDetails.from]);

  useEffect(() => {
    let intervalId;

    if (departureTime) {
      intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(intervalId);
            setBusDeparted(true);
            console.log('Oops, the bus has already left!');
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [departureTime]);
  const {
    name,
    phone,
    from,
    to,
    seats,
    time,
    date,
    amount,
    email,
    busId
  } = paymentDetails || {};


  return (
    <main>
      <div className='update bg'>
        <div>
          <h3>Ticket Details</h3>
          {paymentDetails ? (
            <div>
              <div>
                {busId}
                <p>Ticket Number: {ticketNumber}</p>
                <p>Name: {paymentDetails.name}</p>
                <p>Phone: {paymentDetails.phone}</p>
                {/* Display other payment details */}
              </div>
              <div>
                <h5>
                  <small>
                    {paymentDetails.from} - {paymentDetails.to}
                  </small>
                </h5>
                <p>
                  <small>{paymentDetails.date}</small>
                </p>
                <p>Departure</p>
                <p>Time: {time ? new Date(time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          }) : 'N/A'}</p>
              </div>
              <div>
                <p>One-Way Ticket</p>
                {/* <p>
                  <small>Booked seat(s) No: {selectedSeats.join(', ')}</small>
                </p> */}
                 <p>Selected Seats: { Object.values(paymentDetails.seats).flat().join('')}</p>
  
                <p>
                  <strong>Total Amount paid Ksh{paymentDetails.amount}</strong>
                </p>
                <p>Payment method :MPESA</p>
                {employee && <p>Booked by: {employee}</p>}
              </div>
              <div>
                <button>
                  <PDFDownloadLink
                    document={<MyTcket paymentDetails={paymentDetails} ticketNumber={ticketNumber} employee={employee}/>}
                    fileName="ticket.pdf"
                  >
                    {({ blob, url, loading, error }) =>
                      loading ? 'Loading...' : error ? 'Error occurred while generating PDF' : 'Download Ticket as PDF'
                    }
                  </PDFDownloadLink>
                </button>
              </div>
            </div>
          ) : (
            <p>No ticket details available. Please make a payment first.</p>
          )}
        </div>
   
      </div>

    </main>
  );
};

export default Ticket;
