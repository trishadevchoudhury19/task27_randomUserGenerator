import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ManageUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users from the backend
    axios.get('http://localhost:5000/api/users')  // Change this endpoint as per your backend API
      .then(response => setUsers(response.data))
      .catch(error => console.error("Failed to fetch users", error));
  }, []);

  return (
    <div className="container mt-5">
      <h3 className="text-center mb-4">Manage Users</h3>
      {users.length === 0 ? (
        <div>No users available</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  {/* Add actions like View, Edit, Delete */}
                  <button className="btn btn-warning btn-sm">Edit</button>
                  <button className="btn btn-danger btn-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageUsers;
