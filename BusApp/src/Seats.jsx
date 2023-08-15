
import React, { useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Map } from './Map';
import { GiSteeringWheel } from 'react-icons/gi';

const Seats = () => {
  const { totalSeats } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, selectedBus } = location.state || {};

  console.log('Total Seats:', totalSeats);
  console.log(amount);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const { Driver, NoPlate, PhoneNo } = selectedBus || {};

  const handleSeatClick = (seatNumber) => {
    setSelectedSeats((prevSelectedSeats) => {
      if (prevSelectedSeats.includes(seatNumber)) {
        return prevSelectedSeats.filter((seat) => seat !== seatNumber);
      } else {
        return [...prevSelectedSeats, seatNumber];
      }
    });
  };

  const isSeatSelected = (seatNumber) => {
    return selectedSeats.includes(seatNumber);
  };

  const renderSeats = () => {
    const seats = Array.from({ length: totalSeats }, (_, index) => index + 1);
    console.log('Seats Array:', seats);
    const seatRows = [];
    let currentSeatRow = [];
    let isFirstRow = true;
    let isThirdRow = false;

    for (let i = 0; i < seats.length; i++) {
      const seatNumber = seats[i];
      const seatStatus = isSeatSelected(seatNumber) ? 'selected' : 'available';

      if (isFirstRow && currentSeatRow.length === 2) {
        // Add the GiSteeringWheel icon to the first row after the second seat
        currentSeatRow.push(
          <div key={'icon'} className="steering-wheel-icon">
            <GiSteeringWheel />
          </div>
        );

        // For the first row, add only two seats
        seatRows.push(
          <div className='seat-row' key={seatRows.length}>
            {currentSeatRow}
          </div>
        );
        currentSeatRow = [];
        isFirstRow = false;
        isThirdRow = true;
      }

      if (isThirdRow && currentSeatRow.length === 2) {
        // For the third row, add only two seats
        seatRows.push(
          <div className='seat-row' key={seatRows.length}>
            {currentSeatRow}
          </div>
        );
        currentSeatRow = [];
        isThirdRow = false;
      }

      currentSeatRow.push(
        <button
          key={i}
          className={`seat ${seatStatus}`}
          onClick={() => handleSeatClick(seatNumber)}
        >
          {seatNumber}
        </button>
      );

      if (!isFirstRow && !isThirdRow && currentSeatRow.length === 4) {
        // For other rows (after the first and third), add four seats
        seatRows.push(
          <div className='seat-row' key={seatRows.length}>
            {currentSeatRow}
          </div>
        );
        currentSeatRow = [];
      }
    }

    // Add any remaining seats (if totalSeats is not divisible by 4)
    if (currentSeatRow.length > 0) {
      seatRows.push(
        <div className='seat-row' key={seatRows.length}>
          {currentSeatRow}
        </div>
      );
    }

    return seatRows;
  };

  const selectedSeatsAmount = selectedSeats.length * parseInt(amount, 10);
  const handleProceedToPayment = () => {
    // Perform any necessary data validation or checks before navigating to PaymentDetails
    navigate('/payment-details', {
      state: {
        selectedSeats,
        amount: selectedSeatsAmount,
        from: selectedBus?.from,
        to: selectedBus?.to,
        date: selectedBus?.date,
        time: selectedBus?.time,
        driverName: Driver, // Include the driver details here
        driverPhone: PhoneNo,
        driverNoPlate: NoPlate,
        // Add any other relevant data to be passed to PaymentDetails
      },
    });
  };

  return (
    <div className='myseats'>
      <h2>Select a Seat</h2>
      <p>Selected Seats: {selectedSeats.join(', ')}</p>

      <div>{renderSeats()}</div>
      {selectedSeats.length > 0 && <p>Amount: {selectedSeatsAmount}</p>}
      <div>
        <span className="color-box" style={{ backgroundColor: 'red' }}></span>
      </div>
      <div
        style={{
          backgroundColor: 'red',
          width: '20px',
          height: '20px',
          display: 'inline-block',
          marginLeft: '1.5rem',
        }}
      ></div>
      <div
        style={{
          backgroundColor: 'green',
          width: '20px',
          height: '20px',
          display: 'inline-block',
          marginLeft: '2.5rem',
        }}
      ></div>
      <div
        style={{
          backgroundColor: 'gray',
          width: '20px',
          height: '20px',
          display: 'inline-block',
          marginLeft: '2.5rem',
         
        }}
      ></div>
      <br></br>
      <p style={{ display: 'inline-block', marginLeft: '5px' }}>Booked</p>
      <p style={{ display: 'inline-block', marginLeft: '5px' }}>Selected</p>
      <p style={{ display: 'inline-block', marginLeft: '5px' }}>Available</p>
      <br></br>

      <button onClick={handleProceedToPayment} disabled={selectedSeats.length === 0}>
        Payment Details
      </button>

      <Map
        origin={selectedBus.from}
        destination={selectedBus.to}
        driverName={Driver}
        numberPlate={NoPlate}
        PhoneNo={PhoneNo}
        selectedSeats={selectedSeats}
      />
    </div>
  );
};

export default Seats;
