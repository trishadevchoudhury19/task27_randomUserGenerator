import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [user, setUser] = useState(null);
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUser = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const url = gender ? `https://randomuser.me/api/?gender=${gender}` : `https://randomuser.me/api/`;
      const res = await axios.get(url);
      const fetchedUser = res.data.results[0];
      setUser(fetchedUser);

      // Send to backend
      const response = await axios.post('http://localhost:5000/api/users', {
        name: `${fetchedUser.name.first} ${fetchedUser.name.last}`,
        email: fetchedUser.email,
        phone: fetchedUser.phone,
        location: `${fetchedUser.location.city}, ${fetchedUser.location.country}`,
        photo: fetchedUser.picture.large,
      });

      if (response.status === 200) {
        setSuccessMsg('✅ User profile saved to database successfully!');
      }
    } catch (err) {
      alert("❌ Failed to fetch user or send to backend.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column align-items-center justify-content-center p-4">
      <div className="bg-white shadow p-5 rounded-4 w-100" style={{ maxWidth: '550px' }}>
        <h2 className="text-center mb-4 text-primary">Random User Generator</h2>

        <div className="mb-3">
          <label htmlFor="genderSelect" className="form-label">Select Gender (Optional):</label>
          <select
            id="genderSelect"
            onChange={(e) => setGender(e.target.value)}
            className="form-select"
          >
            <option value="">-- Choose --</option>
            <option value="male">♂️ Male</option>
            <option value="female">♀️ Female</option>
          </select>
        </div>

        <div className="d-grid mb-3">
          <button onClick={fetchUser} className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Generate User'}
          </button>
        </div>

        {successMsg && <div className="alert alert-success text-center">{successMsg}</div>}

        {user && (
          <div className="card border-0 shadow-sm p-3 mt-4">
            <img
              src={user.picture.large}
              alt="User"
              className="rounded-circle mx-auto mb-3"
              style={{ width: '120px', height: '120px', objectFit: 'cover' }}
            />
            <h5 className="text-center">{user.name.first} {user.name.last}</h5>
            <p className="mb-1 text-center"><strong>Email:</strong> {user.email}</p>
            <p className="mb-1 text-center"><strong>Phone:</strong> {user.phone}</p>
            <p className="text-center"><strong>Location:</strong> {user.location.city}, {user.location.country}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
