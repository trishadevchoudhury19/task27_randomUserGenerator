import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Importing necessary components for routing
import AdminLayout from './AdminLayout'; // Admin layout component for the dashboard
import AdminDashboard from './AdminDashboard'; // Admin Dashboard page component
import ManageUsers from './ManageUsers'; // Manage Users page component

function App() {
  const [user, setUser] = useState(null);
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeInfo, setResumeInfo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const fetchUser = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const url = gender ? `https://randomuser.me/api/?gender=${gender}` : `https://randomuser.me/api/`;
      const res = await axios.get(url);
      const fetchedUser = res.data.results[0];

      const response = await axios.post('http://localhost:5000/api/users', {
        name: `${fetchedUser.name.first} ${fetchedUser.name.last}`,
        email: fetchedUser.email,
        phone: fetchedUser.phone,
        location: `${fetchedUser.location.city}, ${fetchedUser.location.country}`,
        photo: fetchedUser.picture.large,
      });

      if (response.status === 200) {
        setSuccessMsg('✅ User profile saved to database successfully!');
        const userId = response.data.userId;
        const fullUser = { ...fetchedUser, id: userId };
        setUser(fullUser);
        getResumeInfo(userId);
      }
    } catch (err) {
      alert('❌ Failed to fetch user or send to backend.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();

    if (!resumeFile || !user) {
      setUploadStatus('❌ Please select a PDF file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      setUploading(true);
      setUploadStatus('');

      const res = await axios.post(`http://localhost:5000/users/${user.id}/upload-resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 200) {
        setUploadStatus('✅ Resume uploaded successfully!');
        getResumeInfo(user.id);
      }
    } catch (err) {
      setUploadStatus('❌ Failed to upload resume.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const getResumeInfo = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/users/${userId}/resume`);
      setResumeInfo(res.data);
    } catch (err) {
      setResumeInfo(null);
      console.warn('No resume found.');
    }
  };

  return (
    <Router>
      <Routes>
        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="manage-users" element={<ManageUsers />} />
        </Route>

        {/* Default route for User-related actions */}
        <Route path="/" element={
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

                  <form onSubmit={handleResumeUpload} className="mt-3">
                    <input
                      type="file"
                      name="resume"
                      accept="application/pdf"
                      className="form-control mb-2"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                    />
                    <button type="submit" className="btn btn-outline-primary" disabled={uploading}>
                      {uploading ? 'Uploading...' : '📤 Upload Resume'}
                    </button>
                    {uploadStatus && <div className="mt-2 text-center">{uploadStatus}</div>}
                  </form>

                  {resumeInfo && (
                    <div className="mt-3 text-center">
                      <p className="mb-1"><strong>Uploaded File:</strong> {resumeInfo.file_path.split('/').pop()}</p>
                      <p><strong>Uploaded At:</strong> {new Date(resumeInfo.uploaded_at).toLocaleString()}</p>
                      <a
                        href={`http://localhost:5000/${resumeInfo.file_path}`}
                        className="btn btn-success btn-sm mt-2"
                        download
                      >
                        ⬇ Download Resume
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Button to navigate to Admin Page */}
              <div className="d-grid mt-4">
                <Link to="/admin" className="btn btn-outline-primary">
                  Go to Admin Dashboard
                </Link>
              </div>

            </div>
          </div>
        } />

        {/* Fallback route to handle unmatched paths */}
        <Route path="*" element={<div className="text-center">Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
