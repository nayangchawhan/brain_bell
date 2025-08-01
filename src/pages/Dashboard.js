import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { ref, onValue, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // custom styling here
import Navbar from '../components/Navbar';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

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

  const handleDownloadPDF = async (test) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;

  let y = height - 40;
  page.drawText(`Title: ${test.title || 'Untitled Test'}`, { x: 50, y, size: 16, font });

  y -= 30;
  page.drawText(`Description: ${test.description || 'N/A'}`, { x: 50, y, size: fontSize, font });

  y -= 25;
  page.drawText(`Duration: ${test.duration || 'N/A'} minutes`, { x: 50, y, size: fontSize, font });

  y -= 30;

  test.questions?.forEach((q, index) => {
    if (y < 80) {
      page = pdfDoc.addPage();
      y = height - 40;
    }

    page.drawText(`Q${index + 1}. ${q.question}`, { x: 50, y, size: fontSize, font });
    y -= 20;

    q.options.forEach((opt, i) => {
      const label = String.fromCharCode(65 + i); // A, B, C, D...
      const isCorrect = q.correct === i;
      page.drawText(`${label}. ${opt} ${isCorrect ? '(C)' : ''}`, { x: 70, y, size: fontSize, font });
      y -= 18;
    });

    y -= 10;
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, `${test.title || 'test'}_questions.pdf`);
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
                <button onClick={() => handleDownloadPDF(test)}>📄 Download PDF</button>
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
