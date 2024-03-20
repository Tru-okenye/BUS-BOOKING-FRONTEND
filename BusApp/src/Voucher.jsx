import React, { useState } from 'react';

const Voucher = () => {
  const [voucher, setVoucher] = useState(null);
  const [voucherNumber, setVoucherNumber] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`http://127.0.0.1:3000/api/vouchers/${voucherNumber}`);
      if (response.ok) {
        const data = await response.json();
        setVoucher(data.voucher); // Change data.vouchers to data.voucher
        setSuccessMessage('Voucher found successfully.');
      } else {
        setError('Failed to fetch voucher.');
      }
    } catch (error) {
      console.error('Error fetching voucher:', error);
      setError('Error fetching voucher. Please try again later.');
    }
  };

  return (
    <>
      <div className='ticketsearch'>
        <h2>Vouchers</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Voucher Number:
            <input
              type="text"
              value={voucherNumber} // Use voucherNumber instead of voucher
              onChange={(e) => setVoucherNumber(e.target.value)} // Update voucherNumber state
            />
          </label>
          <button type="submit">Search</button>
        </form>
        {voucher && (
          <div key={voucher.id}>
            <h3>Voucher Number: {voucher.voucher_number}</h3>
            <h3>Amount: {voucher.amount}</h3>
            <h3>Expiry Date: {voucher.expiry_date}</h3>
          </div>
        )}
        {successMessage && <p>{successMessage}</p>}
        {error && <p>{error}</p>}
      </div>
    </>
  );
};

export default Voucher;
