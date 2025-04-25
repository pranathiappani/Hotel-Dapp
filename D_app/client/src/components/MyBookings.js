import React from 'react';
import Web3 from 'web3';

function MyBookings({ bookings, onCancelBooking }) {
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (isCancelled) => {
    return isCancelled ? (
      <span className="status-badge cancelled">Cancelled</span>
    ) : (
      <span className="status-badge confirmed">Confirmed</span>
    );
  };

  return (
    <div className="my-bookings">
      <h2><i className="fas fa-calendar-alt"></i> My Bookings</h2>
      
      {bookings.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-hotel"></i>
          <p>You haven't made any bookings yet</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className={`booking-card ${booking.isCancelled ? 'cancelled' : ''}`}>
              <div className="booking-header">
                <h3>Booking #{booking.id}</h3>
                {getStatusBadge(booking.isCancelled)}
              </div>
              
              <div className="booking-details">
                <div className="detail-row">
                  <span className="detail-label">Hotel ID:</span>
                  <span className="detail-value">{booking.hotelId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Dates:</span>
                  <span className="detail-value">
                    {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total:</span>
                  <span className="detail-value">
                    {Web3.utils.fromWei(booking.totalAmount, 'ether')} ETH
                  </span>
                </div>
              </div>

              {!booking.isCancelled && (
                <button 
                  className="cancel-btn"
                  onClick={() => onCancelBooking(booking.id)}
                >
                  <i className="fas fa-times"></i> Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;