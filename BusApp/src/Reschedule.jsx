import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { GiSteeringWheel } from 'react-icons/gi';
import { useGlobalContext } from './Context';

const Reschedule = () => {
  const { totalSeats} = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
  
    ticketNumber,
    selectedBus,
    tcktDets,
    ticketBusId,
    Bookedseat,
  } = location.state || {};
  const { bookedSeats, setBookedSeats, selectedSeats, setSelectedSeats } = useGlobalContext();
  const { Driver, NoPlate, PhoneNo, busId } = selectedBus || {};
  const { from, to, seats, time, date, amount, name, phone, ticket_number } = tcktDets || {};

  useEffect(() => {
    setSelectedSeats({});
  
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
        // If the selected bus id is equal to the ticket bus id
        if (busId === ticketBusId) {
        
          // Check if the booked seat is on the ticket
          if (Bookedseat.includes(String(seatNumber))) {
            const response = await fetch(`http://127.0.0.1:3000/api/buses/${busId}/delete_booked_seats`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                bookedSeat: seatNumber,
              }),
            });
  
            if (response.ok) {
              console.log('Successfully unbooked seat:', seatNumber);
  
              setSelectedSeats((prevSelectedSeats) => {
                const updatedSelectedSeats = { ...prevSelectedSeats[busId] };
                delete updatedSelectedSeats[seatNumber];
                console.log('Selected Seats:', updatedSelectedSeats);
                return { ...prevSelectedSeats, [busId]: updatedSelectedSeats };
              });
  
              setBookedSeats((prevBookedSeats) => ({
                ...prevBookedSeats,
                [busId]: prevBookedSeats[busId].filter((seat) => seat !== String(seatNumber)),
              }));
  
              const ticketResponse = await fetch(`http://127.0.0.1:3000/api/tickets/${ticketNumber}/delete_ticket_seat`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  bookedSeat: seatNumber,
                }),
              });
  
              if (!ticketResponse.ok) {
                console.error('Error deleting ticket seat');
              }
            } else {
              console.error('Error unbooking seat');
            }
          } else {
            console.log('This seat is not on the ticket. Cannot unbook.');
          }
        } else {
          console.log('Selected bus id is not equal to ticket bus id. Cannot unbook.');
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
  
      // If selected bus id is different from ticket bus id, update ticket bus id
      if (busId !== ticketBusId) {
        // Unbook seats from the bus
        const unbookedSeatsResponse = await fetch(`http://127.0.0.1:3000/api/buses/${ticketBusId}/delete_book_seats`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookedSeat: Bookedseat, // Send the booked seats to unbook
          }),
        });
  
        if (!unbookedSeatsResponse.ok) {
          console.error('Failed to unbook seats from the bus');
          return null;
        }
  
        // Unbook seats from the ticket's bus
        const unbookedTicketSeatResponse = await fetch(`http://127.0.0.1:3000/api/tickets/${ticketNumber}/del_ticket_seat`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookedSeat: Bookedseat, // Send the booked seats to unbook
          }),
        });
  
        if (!unbookedTicketSeatResponse.ok) {
          console.error('Failed to unbook seats from the ticket bus');
          return null;
        }
  
        // Update ticket time
        const timeResponse = await fetch(`http://127.0.0.1:3000/api/tickets/${ticketNumber}/update_time`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            time: selectedBus.time, // Pass the selected bus time
          }),
        });
  
        if (!timeResponse.ok) {
          console.error('Failed to update ticket time');
          return null;
        }
  
        // Update ticket seat
        const ticketsResponse = await fetch(`http://127.0.0.1:3000/api/tickets/${ticketNumber}/update_ticket_seat`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            new_booked_seat: selectedSeatNumbers,
          }),
        });
  
        if (!ticketsResponse.ok) {
          console.error('Failed to update ticket');
          return null;
        }
  
        // Update bus seat
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
          return null;
        }
  
        // Update ticket bus id
        const ticketBusIdResponse = await fetch(`http://127.0.0.1:3000/api/tickets/${ticketNumber}/update_bus_id`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            new_bus_id: busId,
          }),
        });
  
        if (!ticketBusIdResponse.ok) {
          console.error('Failed to update ticket bus id');
          return null;
        }
      } else {
        // Update ticket seat
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
          return null;
        }
  
        // Update bus seat
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
          return null;
        }
      }
  
      // Fetch updated ticket details including time
      const updatedTicketResponse = await fetch(`http://127.0.0.1:3000/api/tickets/${ticketNumber}`);
      const updatedTicketData = await updatedTicketResponse.json();
  
      // Handle navigation or other actions after successful update
      navigate('/updatedticket', {
        state: {
          updatedTicket: updatedTicketData.data,
          NoPlate,
        },
      });
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
        isSecondRow = true;
      }
  
      if (isSecondRow && currentSeatRow.length === 4) {
        // For the second row, add only 4 seats
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
  console.log('Bookedseat:',typeof Bookedseat);


  return (
    <div className='myseats'>
      <h2>Select a Seat</h2>
{busId}
{ticketBusId}
{busId === ticketBusId && (
      <p style={{ color: 'red' }}>
        Please unbook the seats you selected before selecting new ones.
      </p>
    )}
      <div>{renderSeats()}</div>
      <p>Amount: {amount}</p>
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

export default Reschedule;
