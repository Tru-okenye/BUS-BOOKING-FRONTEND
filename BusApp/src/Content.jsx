import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Ticket from './Ticket';
import { useGlobalContext } from './Context';
import Outbox from './Outbox';
import { FaBars } from 'react-icons/fa';
import Sidebar from "./Sidebar";

export const Content = () => {
  const [buses, setBuses] = useState([]);
  const [departedBuses, setDepartedBuses] = useState([]);
  const [arrivedBuses, setArrivedBuses] = useState([]);
  const { alert, showAlert, openSidebar, openModal, showSidebar } = useGlobalContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { employee } = location.state || {};
 

  useEffect(() => {
    fetchBuses();
    console.log('employeename', employee)
  }, []);

  const fetchBuses = () => {
    fetch('http://localhost:3000/api/buses')
      .then((response) => response.json())
      .then((data) => {
        setBuses(data);
         // Filter departed buses
      const departedBuses = data.filter((bus) => bus.departed);
      setDepartedBuses(departedBuses.map((bus) => bus.id));
      const arrivedBuses = data.filter((bus) => bus.arrived); // Filter arrived buses
      setArrivedBuses(arrivedBuses.map((bus) => bus.id));       })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteBus = (id) => {
    fetch(`http://localhost:3000/api/buses/${id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        showAlert(true, 'success', 'Bus deleted successfully!');
        fetchBuses();
      })
      .catch((error) => {
        console.log('Error deleting bus:', error);
      });
  };

  const handleSeat = (bus) => {
    navigate(`/sadmin/${bus.seats}`, {
      state: {
        selectedBus: {
          from: bus.from,
          to: bus.to,
          date: bus.date,
          time: bus.time,
          Driver: bus.driver_name,
          NoPlate: bus.number_plate,
          PhoneNo: bus.driver_phone_number,
        },
        amount: bus.amount,
        busId: bus.id,
        employee,
      },
    });
  };
  const handleDepart = (busId) => {
    fetch(`http://localhost:3000/api/buses/${busId}/depart`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ departed: true }),
    })
      .then((response) => {
        if (response.ok) {
          // If the request was successful, update the departedBuses state
          setDepartedBuses([...departedBuses, busId]);
          console.log('Bus departed successfully');
        } else {
          console.error('Failed to depart bus');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };
  const handleArrived = (busId) => {
    fetch(`http://localhost:3000/api/buses/${busId}/arrive`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ arrived: true }),
    })
      .then((response) => {
        if (response.ok) {
          // Remove the arrived bus from the buses state
          setBuses(buses.filter((bus) => bus.id !== busId));
          // Add the arrived bus to the arrivedBuses state
          setArrivedBuses([...arrivedBuses, busId]);
          console.log('Bus arrived successfully');
        } else {
          console.error('Failed to mark bus as arrived');
        }
      })
      .catch((error) => {
        console.error('Error marking bus as arrived:', error);
      });
  };



  const allSeatsBooked = (bus) => {
    return bus.booked_seats === bus.seats;
  };

  const isBusDeparted = (busId) => {
    return departedBuses.includes(busId);
  };

  const isBusArrived = (busId) => {
    return arrivedBuses.includes(busId);
  };
  return (
    <>
      <div>
        {showSidebar ? null : (
          <div>
            <button className="sidebar-toggle" onClick={openSidebar}>
              <FaBars />
            </button>
          </div>
        )}
        <Sidebar/>
      </div>

      <div className='booked'>
        <div className=''>
          {alert.show && <Outbox {...alert} removeAlert={showAlert} />}
        </div>
        <div className="bus-list">
          {Array.isArray(buses) && (
            <table>
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Time</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Seats</th>
                  <th>Driver Name</th>
                  <th>Number Plate</th>
                  <th>Driver Phone Number</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {buses
                .filter((bus) => !isBusArrived(bus.id)) // Filter out arrived buses
                .map((bus) => (
                  <tr key={bus.id}>
                    <td>{bus.from}</td>
                    <td>{bus.to}</td>
                    <td>{bus.time ? new Date(bus.time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                    }) : 'N/A'}</td>
                    <td>{bus.date}</td>
                    <td>{bus.amount}</td>
                    <td>{bus.seats}</td>
                    <td>{bus.driver_name}</td>
                    <td>{bus.number_plate}</td>
                    <td>{bus.driver_phone_number}</td>
                    <td>
                      <button disabled={isBusDeparted(bus.id)} onClick={() => deleteBus(bus.id)}>Delete</button>
                      {isBusDeparted(bus.id) ? (
                        <button className="cnt" disabled>
                          Edit
                        </button>
                      ) : (
                        <button className="cnt">
                          <Link to={`/update/${bus.id}`} className='js'>
                            Edit
                          </Link>
                        </button>
                      )}
                      <button disabled={isBusDeparted(bus.id)} className="cnt" onClick={() => handleSeat(bus)}>
                        Seats
                      </button>
                     {allSeatsBooked(bus) && (
                      <>
                      
                      {isBusDeparted(bus.id) ? (
                        <button disabled={false} className="arrived-btn" onClick={() => handleArrived(bus.id)}>
                          Arrived
                        </button>
                      ) : (
                        <button disabled={false} className="depart-btn" onClick={() => handleDepart(bus.id)}>
                          Depart
                        </button>
                      )}
                      </>
  )}
                       
                   
                    
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button className="create-bus">
            <Link to="/create" className='js'>
              Create Bus
            </Link>
          </button>
        </div>
      </div>
    </>
  );
};


