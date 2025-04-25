import React from 'react';

function HotelList({ hotels, onSelectHotel }) {
  return (
    <div className="hotel-grid">
      {hotels.map(hotel => (
        <div key={hotel.id} className="hotel-card">
          <div className="hotel-image">
            <img 
              src={`https://source.unsplash.com/random/300x200/?hotel,${hotel.id}`}
              alt={hotel.name}
            />
          </div>
          <div className="hotel-info">
            <h3>{hotel.name}</h3>
            <p className="location">
              <i className="fas fa-map-marker-alt"></i> {hotel.location}
            </p>
            <div className="hotel-meta">
              <span className="rooms">
                <i className="fas fa-bed"></i> {hotel.availableRooms}/{hotel.totalRooms} rooms
              </span>
              <span className="price">
                <i className="fas fa-tag"></i> {Web3.utils.fromWei(hotel.pricePerNight, 'ether')} ETH/night
              </span>
            </div>
            <button 
              className="book-btn"
              onClick={() => onSelectHotel(hotel)}
              disabled={hotel.availableRooms === 0}
            >
              {hotel.availableRooms === 0 ? 'Sold Out' : 'Book Now'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default HotelList;