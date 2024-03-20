import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from './Context';
import Outbox from './Outbox';

const kenyanCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Kitale', 'Malindi',
  'Garissa', 'Kakamega', 'Nyeri', 'Meru', 'Lamu', 'Machakos', 'Naivasha', 'Bungoma',
  // Add more counties as needed
];

const CreateBusForm = () => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    amount: '',
    date: '',
    time: '',
    seats: '',
    driver_name: '',
    number_plate: '',
    driver_phone_number: '',
  });

  const [rawTime, setRawTime] = useState('');

  const { alert, showAlert } = useGlobalContext();
  const navigate = useNavigate();

  const autocompleteFromRef = useRef(null);
  const autocompleteToRef = useRef(null);

  const handlePlaceChange = (value, field) => {
    setFormData({ ...formData, [field]: value });
  };

// Inside handleInputChange function in CreateBusForm component
const handleInputChange = (e) => {
  const { name, value } = e.target;

  if (name === 'time') {
    // Convert raw time string to Date object
    const rawTime = new Date(value);
    
    // Format time using toLocaleTimeString
    const formattedTime = rawTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    setRawTime(formattedTime);
  }

  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: value,
  }));
};


  const handleSubmit = (e) => {
    e.preventDefault();

    for (const field in formData) {
      if (formData[field] === '') {
        showAlert(true, 'danger', 'Please fill in all fields!');
        return;
      }
    }

    // Perform create operation using the form data
    fetch('http://127.0.0.1:3000/api/buses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error && data.error.includes('Bus with the same number plate already exists')) {
          showAlert(true, 'danger', 'Bus with the same number plate already exists');
        } else {
          showAlert(true, 'success', 'New bus created!');
          console.log('Bus created successfully:', data);
          navigate('/content'); // Navigate back to the previous page
        }
      })
      .catch((error) => {
        console.log('Error creating bus:', error);
      });
  };

  return (
    <>
      <div className="update bg">
        <div>
          <h2>Create Bus</h2>
          {alert.show && <Outbox {...alert} removeAlert={showAlert} />}
          <form onSubmit={handleSubmit}>
            <label>
              From:
            </label><br />
            <input
              type="text"
              name="from"
              value={formData.from}
              onChange={handleInputChange}
              placeholder="Enter origin"
              list="fromList"
            />
            <datalist id="fromList">
              {kenyanCounties.map((county, index) => (
                <option key={index} value={county} />
              ))}
            </datalist>

            <label>
              To:
            </label><br />
            <input
              type="text"
              name="to"
              value={formData.to}
              onChange={handleInputChange}
              placeholder="Enter destination"
              list="toList"
            />
            <datalist id="toList">
              {kenyanCounties.map((county, index) => (
                <option key={index} value={county} />
              ))}
            </datalist>
            <br />

            <label>
              Amount:
            </label> <br />
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
            /><br></br>

            <label>
              Date:
            </label><br />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
            /><br></br>

            <label>
              Time:
            </label> <br />
            <input
              type="text"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
            /><br></br>

            <label>
              Seats:
            </label><br />
            <input
              type="number"
              name="seats"
              value={formData.seats}
              onChange={handleInputChange}
            /><br></br>

            <label>
              Driver Name:
            </label><br />
            <input
              type="text"
              name="driver_name"
              value={formData.driver_name}
              onChange={handleInputChange}
            /><br></br>

            <label>
              Number Plate:
            </label><br />
            <input
              type="text"
              name="number_plate"
              value={formData.number_plate}
              onChange={handleInputChange}
            /><br></br>

            <label>
              Driver Phone Number:
            </label><br />
            <input
              type="text"
              name="driver_phone_number"
              value={formData.driver_phone_number}
              onChange={handleInputChange}
            /><br></br>

            <button type="submit">Create Bus</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateBusForm;
