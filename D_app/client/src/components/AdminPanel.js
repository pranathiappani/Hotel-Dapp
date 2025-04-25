// src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';

function AdminPanel({ contract, account }) {
  const [isOwner, setIsOwner] = useState(false);
  const [hotelName, setHotelName] = useState('');
  const [location, setLocation] = useState('');
  const [totalRooms, setTotalRooms] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Check if current user is the contract owner
  useEffect(() => {
    const checkOwner = async () => {
      if (contract && account) {
        try {
          const contractOwner = await contract.methods.owner().call();
          setIsOwner(account.toLowerCase() === contractOwner.toLowerCase());
        } catch (err) {
          console.error("Error checking owner:", err);
        }
      }
    };
    
    checkOwner();
  }, [contract, account]);

  // If user is not the owner, don't render the panel
  if (!isOwner) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);
    
    try {
      // Convert price to wei for blockchain
      const priceInWei = window.web3.utils.toWei(pricePerNight, 'ether');
      
      // Call the contract method
      await contract.methods
        .addHotel(hotelName, location, parseInt(totalRooms), priceInWei)
        .send({ from: account });
      
      // Reset form fields on success
      setHotelName('');
      setLocation('');
      setTotalRooms('');
      setPricePerNight('');
      setSuccess(true);
      
      // Refresh the page to show the new hotel (or implement a callback to reload hotels)
      window.location.reload();
      
    } catch (err) {
      console.error("Error adding hotel:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel - Add New Hotel</h2>
      
      {success && (
        <div className="success-message">
          Hotel added successfully!
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Hotel Name</label>
          <input
            type="text"
            value={hotelName}
            onChange={(e) => setHotelName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Total Rooms</label>
          <input
            type="number"
            min="1"
            value={totalRooms}
            onChange={(e) => setTotalRooms(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Price Per Night (ETH)</label>
          <input
            type="number"
            min="0.001"
            step="0.001"
            value={pricePerNight}
            onChange={(e) => setPricePerNight(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Add Hotel'}
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;