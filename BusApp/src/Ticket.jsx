import React, {useEffect, useState} from 'react';
import { useLocation } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MyTcket from './MyTcket';
import { Map } from './Map';
import { parse, differenceInSeconds, setHours, setMinutes } from 'date-fns';

const Ticket = () => {
  const location = useLocation();
  const { paymentDetails, driverName, driverPhone, driverNoPlate } = location.state || {};
  const selectedSeats = paymentDetails.seats || [];
  // State to store the bus position, time remaining, and other details
    const [busPosition, setBusPosition] = useState(null);
  const [departureTime, setDepartureTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
const [totalDistance, setTotalDistance] = useState(0);
 const [isDepartureTimePassed, setIsDepartureTimePassed] = useState(false);
   const [busDeparted, setBusDeparted] = useState(false);

  useEffect(() => {
    const departureTimeStr = paymentDetails.time;
    const departureTime = parse(departureTimeStr, 'HH:mm', new Date());

    // Set the departure time in state
    setDepartureTime(departureTime);

    // Calculate the time remaining between the current time and the departure time
    const currentTime = new Date();
    const timeDiff = differenceInSeconds(departureTime, currentTime);
    setTimeRemaining(Math.max(timeDiff, 0));
console.log('Time Remaining:', Math.max(timeDiff, 0));
    // Show the current bus position as a marker on the map
    setBusPosition(paymentDetails.from);
  }, [paymentDetails.time, paymentDetails.from]);

  useEffect(() => {
  if (departureTime && timeRemaining > 0) {
    // Bus is already moving, no need to update timeRemaining further
    return;
  }

  // Calculate the time remaining between the current time and the departure time
  const currentTime = new Date();
  const timeDiff = differenceInSeconds(departureTime, currentTime);
   console.log('Time Remaining:', Math.max(timeDiff, 0));
  setTimeRemaining(Math.max(timeDiff, 0));
}, [departureTime, timeRemaining]);



useEffect(() => {
  const departureDateStr = paymentDetails.date;
  const departureTimeStr = paymentDetails.time;
  const departureDateTime = parse(departureDateStr + ' ' + departureTimeStr, 'yyyy-MM-dd HH:mm', new Date());

  // Set the departure time in state
  setDepartureTime(departureDateTime);

  // Calculate the time remaining between the current time and the departure time
  const currentTime = new Date();
  const timeDiff = differenceInSeconds(departureDateTime, currentTime);
  setTimeRemaining(Math.max(timeDiff, 0));

  // Show the current bus position as a marker on the map
  setBusPosition(paymentDetails.from);


}, [paymentDetails.date, paymentDetails.time, paymentDetails.from]);

useEffect(() => {
  let intervalId;

  if (departureTime && !isDepartureTimePassed) {
    intervalId = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(intervalId);
          setIsDepartureTimePassed(true);
          setBusDeparted(true);
          console.log('Oops, the bus has already left!');
          return 0;
        }
      });
    }, 1000);

    // Clean up the interval when the component unmounts or when the departure time is passed
    return () => clearInterval(intervalId);
  }
}, [departureTime, isDepartureTimePassed, busDeparted]);

  
  const {
    name,
    phone,
    from,
    to,
    seats,
    time,
    date,
    amount,
  } = paymentDetails || {};

 

  return (
    <main>
      <div className='update bg'>
        <div>
      <h3>Ticket Details</h3>
      {paymentDetails ? (
        <div>
          <div>
            <p>Name: {name}</p>
            <p>Phone: {phone}</p>

            
            {/* Display other payment details */}
          </div>
          <div>
            <h5>
              <small>
                {from} - {to}
              </small>
            </h5>
            <p>
              <small>{date}</small>
            </p>
            <p>Departure</p>
            <p>
              <small>{time}hrs</small>
            </p>
          </div>

          <div>
            <p>One-Way Ticket</p>
            <p>
              <small>Selected seat(s) No: {seats?.join(', ')}</small>
            </p>
            <p>
              <strong>Total Amout paid Ksh{amount}</strong>
            </p>
            
          </div>

          
          <div>
          
          </div>
          
             {isDepartureTimePassed ? (
              <div>
        <div className="alert">
          <p>Oops, the bus has already left!</p>
        </div>
        <div>
          <button>
          {/* Add a download button to download the PDF */}
          <PDFDownloadLink document={<MyTcket paymentDetails={paymentDetails} />} fileName="ticket.pdf" className='js'>
            {({ blob, url, loading, error }) =>
              loading ? 'Loading...' : error ? 'Error occurred while generating PDF' : 'Download Ticket as PDF'
            }
          </PDFDownloadLink>
          </button>
        </div>
        </div>
      ) : (
        <div>
          <button>
          {/* Add a download button to download the PDF */}
          <PDFDownloadLink document={<MyTcket paymentDetails={paymentDetails} />} fileName="ticket.pdf">
            {({ blob, url, loading, error }) =>
              loading ? 'Loading...' : error ? 'Error occurred while generating PDF' : 'Download Ticket as PDF'
            }
          </PDFDownloadLink>
          </button>
        </div>
      )}

        </div>
              
      ) : (
        <p>No ticket details available. Please make a payment first.</p>
      )}

</div>
</div>
       <Map
        origin={from}
        destination={to}
        driverName={driverName}
        PhoneNo={driverPhone}
       numberPlate={driverNoPlate}
        selectedSeats={selectedSeats}
       currentBusPosition={busPosition}// Pass the current position to the Map component
        timeRemaining={timeRemaining} 
       setBusPosition={setBusPosition}
       busDeparted={busDeparted}
       
      />
    </main>
  );
};

export default Ticket;
