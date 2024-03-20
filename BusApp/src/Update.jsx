import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalContext } from './Context';
import Outbox from './Outbox';

const kenyanCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Kitale', 'Malindi',
  'Garissa', 'Kakamega', 'Nyeri', 'Meru', 'Lamu', 'Machakos', 'Naivasha', 'Bungoma',
  // Add more counties as needed
];

const UpdateBusForm = () => {
  const { id } = useParams(); // Get the bus ID from the URL
  const { formData, setFormData, rawTime, setRawTime } = useGlobalContext();
  const { alert, showAlert } = useGlobalContext();
  const navigate = useNavigate();
  const autocompleteFromRef = useRef(null);
  const autocompleteToRef = useRef(null);

  useEffect(() => {
    // Fetch the bus data using the ID
    fetch(`http://127.0.0.1:3000/api/buses/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setFormData(data);
      })
      .catch((error) => {
        console.log('Error fetching bus:', error);
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'time') {
      console.log(value); // Add this line to check the rawTime value
      setRawTime(value);
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Perform update operation using the form data
    fetch(`http://127.0.0.1:3000/api/buses/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Bus updated successfully:', data);
        navigate('/content'); // Navigate back to the previous page
        showAlert(true, 'success', 'Bus updated successfully!');
      })
      .catch((error) => {
        console.log('Error updating bus:', error);
      });
  };

  return (
    <>
      <div className="update bg">
        <div>
          <h2>Update Bus</h2>
          <form onSubmit={handleSubmit}>
            {alert.show && <Outbox {...alert} removeAlert={showAlert} />}
            <label>
              From:
              <input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                list="fromList"
              />
            </label>
            <datalist id="fromList">
              {kenyanCounties.map((county, index) => (
                <option key={index} value={county} />
              ))}
            </datalist>
            <br />
            <label>
              To:
              <input
                type="text"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                list="toList"
              />
            </label>
            <datalist id="toList">
              {kenyanCounties.map((county, index) => (
                <option key={index} value={county} />
              ))}
            </datalist>
            <br />
            <label>
              Amount:
            </label><br />
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
            />
            <br />
            <label>
              Date:
            </label><br />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
            />
            <br />
            <label>
              Time:
            </label><br />
            <input
              type="text"
              name="time"
              value={rawTime}
              onChange={handleInputChange}
            />
            <br />
            <label>
              Seats:
            </label><br />
            <input
              type="number"
              name="seats"
              value={formData.seats}
              onChange={handleInputChange}
            />
            <br />
            <label>
              Driver Name:
            </label><br />
            <input
              type="text"
              name="driver_name"
              value={formData.driver_name}
              onChange={handleInputChange}
            />
            <br />
            <label>
              Number Plate:
            </label><br />
            <input
              type="text"
              name="number_plate"
              value={formData.number_plate}
              onChange={handleInputChange}
            />
            <br />
            <label>
              Driver Phone Number:
            </label><br />
            <input
              type="text"
              name="driver_phone_number"
              value={formData.driver_phone_number}
              onChange={handleInputChange}
            />
            <br />
            <button type="submit">Update Bus</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdateBusForm;
