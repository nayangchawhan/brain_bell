import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { ref as dbRef, onValue, remove, get, ref } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // custom styling here
import Navbar from '../components/Navbar';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import * as fontkit from 'fontkit';
import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline, MdOutlineFileDownload  } from "react-icons/md";
import { FaRegShareSquare } from "react-icons/fa";

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

  // ✅ Register fontkit before using custom fonts
  pdfDoc.registerFontkit(fontkit);

  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  // ✅ Load Unicode font
  const fontBytes = await fetch('/fonts/NotoSansDevanagari-Regular.ttf').then(res => res.arrayBuffer());
  const unicodeFont = await pdfDoc.embedFont(fontBytes);

  const fontSize = 12;
  let y = height - 40;

  const addNewPage = () => {
    page = pdfDoc.addPage();
    y = height - 40;
  };

  page.drawText(`Title: ${test.title || 'Untitled Test'}`, {
    x: 50, y, size: 16, font: unicodeFont,
  });
  y -= 30;

  page.drawText(`Description: ${test.description || 'N/A'}`, {
    x: 50, y, size: fontSize, font: unicodeFont,
  });
  y -= 25;

  page.drawText(`Duration: ${test.duration || 'N/A'} minutes`, {
    x: 50, y, size: fontSize, font: unicodeFont,
  });
  y -= 30;

  for (let index = 0; index < test.questions?.length; index++) {
    const q = test.questions[index];
    if (y < 80) addNewPage();

    page.drawText(`Q${index + 1}. ${q.question}`, {
      x: 50, y, size: fontSize, font: unicodeFont,
    });
    y -= 20;

    for (let i = 0; i < q.options.length; i++) {
      const label = String.fromCharCode(65 + i);
      const isCorrect = q.correct === i;
      const optionText = `${label}. ${q.options[i]}${isCorrect ? ' (Correct)' : ''}`;

      page.drawText(optionText, {
        x: 70, y, size: fontSize, font: unicodeFont,
      });
      y -= 18;

      if (y < 60) addNewPage();
    }

    y -= 10;
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, `${test.title || 'test'}_questions.pdf`);
};

const handleDownloadResults = async (test) => {
  const testId = typeof test === "string" ? test : test.id;

  if (!testId) {
    alert("Invalid test ID");
    return;
  }
 
  const resultsRef = ref(db, `results/${testId}`);
  const snapshot = await get(resultsRef);

  if (!snapshot.exists()) {
    alert("No results found for this test");
    return;
  }

  const resultsData = snapshot.val();

  const pdfDoc = await PDFDocument.create();

  pdfDoc.registerFontkit(fontkit);

  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  // Load Unicode font (ensure the font path is correct in /public/fonts)
  const fontBytes = await fetch('/fonts/NotoSansDevanagari-Regular.ttf').then(res => res.arrayBuffer());
  const unicodeFont = await pdfDoc.embedFont(fontBytes);

  const fontSize = 12;
  let y = height - 40;

  // Title
  page.drawText(`Test Results: ${test.title || 'Untitled Test'}`, {
    x: 50,
    y,
    size: 16,
    font: unicodeFont,
  });

  y -= 30;

  // Table Headers
  page.drawText("No", { x: 50, y, size: fontSize, font: unicodeFont });
  page.drawText("Attender", { x: 90, y, size: fontSize, font: unicodeFont });
  page.drawText("Obtained", { x: 300, y, size: fontSize, font: unicodeFont });
  page.drawText("Total", { x: 400, y, size: fontSize, font: unicodeFont });

  y -= 20;

  Object.values(resultsData).forEach((result, index) => {
    // If we reach the bottom of the page, add a new one
    if (y < 50) {
      page = pdfDoc.addPage();
      y = height - 40;

      // Repeat table headers on new page
      page.drawText("No", { x: 50, y, size: fontSize, font: unicodeFont });
      page.drawText("Attender", { x: 90, y, size: fontSize, font: unicodeFont });
      page.drawText("Obtained", { x: 300, y, size: fontSize, font: unicodeFont });
      page.drawText("Total", { x: 400, y, size: fontSize, font: unicodeFont });

      y -= 20;
    }

    page.drawText(`${index + 1}`, { x: 50, y, size: fontSize, font: unicodeFont });
    page.drawText(`${result.attenderName || 'N/A'}`, { x: 90, y, size: fontSize, font: unicodeFont });
    page.drawText(`${result.score}`, { x: 300, y, size: fontSize, font: unicodeFont });
    page.drawText(`${result.total}`, { x: 400, y, size: fontSize, font: unicodeFont });

    y -= 18;
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, `${test.title || 'test'}_results.pdf`);
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
              <button onClick={() => handleEdit(test.id)}><CiEdit />Edit</button>
              <button onClick={() => handleDelete(test.id)}><MdDeleteOutline /> Delete</button>
              <p>{test.description}</p>
              <div className="test-actions">
                <button onClick={() => handleShare(test.id)}><FaRegShareSquare /> Share</button>
                <button onClick={() => handleDownloadPDF(test)}><MdOutlineFileDownload /> Download PDF</button>
                <button onClick={() => handleDownloadResults(test)}><MdOutlineFileDownload />Download Results</button>
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
