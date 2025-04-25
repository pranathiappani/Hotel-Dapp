import React, { useState } from 'react';
import Web3 from 'web3';

function BookingForm({ hotel, onBookRoom, onClose }) {
  const [dates, setDates] = useState({
    checkIn: '',
    checkOut: ''
  });

  const calculateTotal = () => {
    if (dates.checkIn && dates.checkOut) {
      const nights = (new Date(dates.checkOut) - new Date(dates.checkIn)) / (1000 * 60 * 60 * 24);
      return nights * hotel.pricePerNight;
    }
    return 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dates.checkIn && dates.checkOut) {
      onBookRoom(hotel.id, dates.checkIn, dates.checkOut, hotel.pricePerNight);
    }
  };

  return (
    <div className="booking-form">
      <h2>Book {hotel.name}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Check-in Date</label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={dates.checkIn}
            onChange={(e) => setDates({...dates, checkIn: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Check-out Date</label>
          <input
            type="date"
            min={dates.checkIn || new Date().toISOString().split('T')[0]}
            value={dates.checkOut}
            onChange={(e) => setDates({...dates, checkOut: e.target.value})}
            required
          />
        </div>
        
        <div className="price-summary">
          <h4>Price Summary</h4>
          <div className="price-row">
            <span>Price per night:</span>
            <span>{Web3.utils.fromWei(hotel.pricePerNight, 'ether')} ETH</span>
          </div>
          <div className="price-row">
            <span>Total nights:</span>
            <span>
              {dates.checkIn && dates.checkOut ? 
                ((new Date(dates.checkOut) - new Date(dates.checkIn)) / (1000 * 60 * 60 * 24)) : 0}
            </span>
          </div>
          <div className="price-row total">
            <span>Total amount:</span>
            <span>{Web3.utils.fromWei(calculateTotal().toString(), 'ether')} ETH</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="confirm-btn">
            Confirm Booking
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingForm;