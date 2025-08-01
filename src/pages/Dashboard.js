import React, { useEffect, useState } from 'react';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [createdTests, setCreatedTests] = useState([]);
  const [attendedTests, setAttendedTests] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const userId = user.uid;

    const testsRef = ref(database, 'tests/');
    const attemptsRef = ref(database, 'attempts/');

    // Fetch tests created by user
    onValue(testsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const filtered = Object.entries(data)
          .filter(([_, val]) => val.createdBy === userId)
          .map(([key, val]) => ({ id: key, ...val }));
        setCreatedTests(filtered);
      }
    });

    // Fetch attempts by user
    onValue(attemptsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const filtered = Object.entries(data)
          .filter(([_, val]) => val.userId === userId)
          .map(([key, val]) => ({ id: key, ...val }));
        setAttendedTests(filtered);
      }
    });
  }, [user, navigate]);

  return (
    <div style={{ padding: '40px', fontFamily: 'Segoe UI' }}>
      <h2>Welcome, {user?.displayName || user?.email}</h2>

      <section>
        <h3 style={{ color: '#6f42c1' }}>📚 Tests Created By You</h3>
        {createdTests.length ? (
          <ul>
            {createdTests.map(test => (
              <li key={test.id}>
                <strong>{test.title}</strong> - {test.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>No tests created.</p>
        )}
      </section>

      <section>
        <h3 style={{ color: '#6f42c1' }}>📝 Tests You Have Attended</h3>
        {attendedTests.length ? (
          <ul>
            {attendedTests.map(attempt => (
              <li key={attempt.id}>
                <strong>{attempt.testTitle}</strong> - Score: {attempt.score}
              </li>
            ))}
          </ul>
        ) : (
          <p>No test attempts found.</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
