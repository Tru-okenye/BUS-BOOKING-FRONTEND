import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { GiSteeringWheel } from 'react-icons/gi';
import { useGlobalContext } from './Context';

const SeatChange = () => {
  const { busId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    totalSeats,
    ticketNumber,
    paidAmount,
    selectedBus,
    Bookedseat,
    ticketId,
  } = location.state || {};
  const { bookedSeats, setBookedSeats, selectedSeats, setSelectedSeats } = useGlobalContext();
  const { Driver, NoPlate, PhoneNo } = selectedBus || {};

  useEffect(() => {
    setSelectedSeats({});
    console.log('booked seats',Bookedseat)
  }, []);

  useEffect(() => {
    const fetchBookedSeats = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:3000/api/buses/${busId}/fetch_booked_seats`);
        const data = await response.json();
        const fetchedBookedSeats = data.booked_seats || [];
        setBookedSeats((prevBookedSeats) => ({
          ...prevBookedSeats,
          [busId]: fetchedBookedSeats,
        }));
      } catch (error) {
        console.error('Error fetching booked seats:', error);
      }
    };

    fetchBookedSeats();
  }, [busId, setBookedSeats]);

  const handleSeatClick = async (seatNumber) => {
    try {
        const isAlreadyBooked = isSeatBooked(seatNumber);

        if (isAlreadyBooked) {
            const response = await fetch(`http://127.0.0.1:3000/api/buses/${busId}/delete_booked_seats`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookedSeat: seatNumber, // Send the bookedSeat to unbook
                }),
            });

            if (response.ok) {
                console.log('Successfully unbooked seat:', seatNumber);

                // Remove the unbooked seat from selectedSeats
                setSelectedSeats((prevSelectedSeats) => {
                    const updatedSelectedSeats = { ...prevSelectedSeats[busId] };
                    delete updatedSelectedSeats[seatNumber];
                    console.log('Selected Seats:', updatedSelectedSeats);
                    return { ...prevSelectedSeats, [busId]: updatedSelectedSeats };
                });

                // Remove the unbooked seat from bookedSeats
                setBookedSeats((prevBookedSeats) => ({
                    ...prevBookedSeats,
                    [busId]: prevBookedSeats[busId].filter((seat) => seat !== String(seatNumber)),
                }));

                // Remove the unbooked seat from the corresponding ticket
                const ticketResponse = await fetch(`http://127.0.0.1:3000/api/tickets/${ticketNumber}/delete_ticket_seat`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        bookedSeat: seatNumber, // Send the bookedSeat to unbook
                    }),
                });

                if (!ticketResponse.ok) {
                    console.error('Error deleting ticket seat');
                }
            } else {
                console.error('Error unbooking seat');
            }
        } else {
            setSelectedSeats((prevSelectedSeats) => {
                const updatedSelectedSeats = { ...prevSelectedSeats[busId] };
                updatedSelectedSeats[seatNumber] = !updatedSelectedSeats[seatNumber];
                console.log('Selected Seats:', updatedSelectedSeats);
                return { ...prevSelectedSeats, [busId]: updatedSelectedSeats };
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const updateSeat = async () => {

    try {
     // Concatenate selected seat numbers into a string
     let selectedSeatNumbers = '';
     for (const busId in selectedSeats) {
         for (const seatNumber in selectedSeats[busId]) {
             if (selectedSeats[busId][seatNumber]) {
                 selectedSeatNumbers += seatNumber + ', ';
             }
         }
     }
     // Remove trailing comma and space
     selectedSeatNumbers = selectedSeatNumbers.slice(0, -2);

        // Update the ticket seat
        const ticketResponse = await fetch(`http://127.0.0.1:3000/api/tickets/${ticketNumber}/update_ticket_seat`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                new_booked_seat: selectedSeatNumbers,
            }),
        });

        if (!ticketResponse.ok) {
            console.error('Failed to update ticket');
            console.error('ticketnumber', ticketNumber);
            return null;
        }

        // Update the bus seat
        const busResponse = await fetch(`http://127.0.0.1:3000/api/buses/${busId}/update_bus_seat`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                new_booked_seat: selectedSeatNumbers,
            }),
        });

        if (!busResponse.ok) {
            console.error('Failed to update bus seat');
            console.error('Failed to update bus seat', selectedSeatNumbers);
            return null;
        }

        const ticketData = await ticketResponse.json();
        console.log(ticketData.ticket);

        navigate('/updatedticket', {
            state: {
                updatedTicket: ticketData.ticket,
            },
        });
        return ticketData.ticket;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};


  const isSeatSelected = (seatNumber) => {
    const selectedSeatsForBus = selectedSeats[busId] || {};
    return selectedSeatsForBus[seatNumber];
  };

  const isSeatBooked = (seatNumber) => {
    const bookedSeatsForSelectedBus = bookedSeats[busId] || [];
    return bookedSeatsForSelectedBus.includes(String(seatNumber));
  };

  const renderSeats = () => {
    const seats = Array.from({ length: totalSeats }, (_, index) => index + 1);
    const seatRows = [];
    let currentSeatRow = [];
    let isFirstRow = true;
    let isSecondRow = false;
    let isThirdRow = false;
  
    for (let i = 0; i < seats.length; i++) {
      const seatNumber = seats[i];
      const seatStatus = isSeatSelected(seatNumber)
        ? 'selected'
        : isSeatBooked(seatNumber)
        ? 'booked'
        : 'available';
  
      const isDisabled = isSeatBooked(seatNumber) && !Bookedseat.includes(String(seatNumber));
  
      if (isFirstRow && currentSeatRow.length === 2) {
        currentSeatRow.push(
          <div key={'icon'} className="steering-wheel-icon">
            <GiSteeringWheel />
          </div>
        );
  
        seatRows.push(
          <div className='seat-row' key={seatRows.length}>
            {currentSeatRow}
          </div>
        );
        currentSeatRow = [];
        isFirstRow = false;
        isSecondRow = true;
      }
  
      if (isSecondRow && currentSeatRow.length === 4) {
        seatRows.push(
          <div className='seat-row' key={seatRows.length}>
            {currentSeatRow}
          </div>
        );
        currentSeatRow = [];
        isSecondRow = false;
        isThirdRow = true;
      }
      if (isThirdRow && currentSeatRow.length === 2) {
        // For the third row, add only 2 seats
        seatRows.push(
          <div className='thirdrow' key={seatRows.length}>
            <div className="door-space"></div> {/* Empty space for the door */}
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
          disabled={isDisabled}
        >
          {seatNumber}
        </button>
      );
  
      if (!isFirstRow && !isSecondRow && !isThirdRow && currentSeatRow.length === 4) {
        // For other rows (after the first, second, and third), add four seats
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
      if (seatRows.length > 0) {
        // Add remaining seats to the row above the last row
        const lastRowIndex = seatRows.length - 1;
        const lastRowSeats = seatRows[lastRowIndex].props.children.length;
        if (lastRowSeats + currentSeatRow.length <= 5) {
          seatRows[lastRowIndex] = (
            <div className='seat-row' key={lastRowIndex}>
              {seatRows[lastRowIndex].props.children.concat(currentSeatRow)}
            </div>
          );
        } else {
          // If adding remaining seats exceeds 5 seats, add a new row
          seatRows.push(
            <div className='seat-row' key={seatRows.length}>
              {currentSeatRow}
            </div>
          );
        }
      } else {
        // If there are no existing rows, add remaining seats as a new row
        seatRows.push(
          <div className='seat-row' key={seatRows.length}>
            {currentSeatRow}
          </div>
        );
      }
    }
  
    return seatRows;
  };
  
  console.log('Booked Seats:', bookedSeats);
  console.log('Selected Seats:', selectedSeats);

  return (
    <div className='myseats'>
      <h2>Select a Seat</h2>
     
      <div>{renderSeats()}</div>
      <p>Amount: {paidAmount}</p>
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
          backgroundColor: 'gray',
          width: '20px',
          height: '20px',
          display: 'inline-block',
          marginLeft: '2.5rem',
        }}
      ></div>
      <br></br>
      <p style={{ display: 'inline-block', marginLeft: '5px' }}>Booked</p>
      <p style={{ display: 'inline-block', marginLeft: '5px' }}>Available</p>
      <br></br>
      <button onClick={() => updateSeat(ticketNumber, selectedSeats)}>Update Seat</button>

    </div>
  );
};

export default SeatChange;
