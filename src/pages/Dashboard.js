import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { ref, onValue, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // custom styling here
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const testRef = ref(db, 'tests/' + currentUser.uid);

    onValue(testRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const testArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setTests(testArray);
      } else {
        setTests([]);
      }
    });
  }, [currentUser]);

  const handleDelete = (testId) => {
    if (!currentUser) return;
    const testRef = ref(db, `tests/${currentUser.uid}/${testId}`);
    remove(testRef);
  };

  const handleEdit = (testId) => {
    navigate(`/edit-test/${testId}`);
  };

  const handleShare = (testId) => {
    const link = `${window.location.origin}/attend-test/${testId}`;
    navigator.clipboard.writeText(link);
    alert('Test link copied to clipboard!');
  };

  return (
    <div>
      <Navbar />
    <div className="dashboard-container">
      <h2>My Created Tests</h2>
      {tests.length === 0 ? (
        <p>No tests created yet.</p>
      ) : (
        <ul className="test-list">
          {tests.map((test) => (
            <li key={test.id} className="test-card">
              <h3>{test.title || 'Untitled Test'}</h3>
              <p>{test.description}</p>
              <div className="test-actions">
                <button onClick={() => handleEdit(test.id)}>✏️ Edit</button>
                <button onClick={() => handleDelete(test.id)}>🗑️ Delete</button>
                <button onClick={() => handleShare(test.id)}>🔗 Share</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
    </div>
  );
};

export default Dashboard;
