import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/resumes')
      .then(res => {
        setResumes(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load resumes');
        setLoading(false);
        console.error(err);
      });
  }, []);

  if (loading) {
    return <div className="text-center">Loading resumes...</div>;
  }

  if (error) {
    return <div className="text-center text-danger">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h3 className="mb-4 text-center">📂 Uploaded Resumes</h3>
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Resume</th>
            <th>Upload Date</th>
          </tr>
        </thead>
        <tbody>
          {resumes.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">No resumes uploaded yet.</td>
            </tr>
          ) : (
            resumes.map(resume => (
              <tr key={resume.id}>
                <td>{resume.name}</td>
                <td>{resume.email}</td>
                <td>
                  <a href={`http://localhost:5000${resume.file_path}`} download className="btn btn-sm btn-success">
                    ⬇ Download Resume (PDF)
                  </a>
                </td>
                <td>{new Date(resume.uploaded_at).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
