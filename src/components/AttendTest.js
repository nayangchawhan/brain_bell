import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, get, push, set } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FaRegClock } from "react-icons/fa";
import '../styles/AttendTest.css';

const AttendTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();

  const [user, setUser] = useState(null);
  const [test, setTest] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [attenderName, setAttenderName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // 🔐 User auth + prevent re-attempt logic
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        alert('You must be logged in to attend the test.');
        navigate('/');
        return;
      }

      setUser(firebaseUser);

      // ✅ Check if already attempted
      const resultSnap = await get(ref(db, `results/${testId}`));
      if (resultSnap.exists()) {
        const results = Object.values(resultSnap.val());
        const hasAttempted = results.some(
          (result) => result.userId === firebaseUser.uid
        );
        if (hasAttempted) {
          alert('You have already attended this test.');
          navigate('/');
          return;
        }
      }

      // ✅ Load test
      const snapshot = await get(ref(db, 'tests'));
      if (snapshot.exists()) {
        const allTests = snapshot.val();
        let testFound = null;

        for (const userTests of Object.values(allTests)) {
          for (const [id, testData] of Object.entries(userTests)) {
            if (id === testId) {
              testFound = testData;
              break;
            }
          }
          if (testFound) break;
        }

        if (testFound) {
          setTest(testFound);
        } else {
          alert('Test not found.');
          navigate('/');
        }
      }
    });

    // 🚫 Block right-click, refresh, and back nav
    const handleContextMenu = (e) => e.preventDefault();
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
        e.preventDefault();
      }
    };
    const handlePopState = () => {
      alert('Back navigation is disabled during the test.');
      window.history.pushState(null, null, window.location.pathname);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      unsubscribe();
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [testId, navigate, auth]);

  // ⏱️ Timer effect
  useEffect(() => {
    if (timeLeft <= 0 && test && started) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      if (started) setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, test, started]);

  // 🎲 Start test with shuffled questions
  const startTest = () => {
    if (!attenderName.trim()) {
      alert('Please enter your name to begin.');
      return;
    }

    const questions = [...test.questions];
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    const limited = questions.slice(0, parseInt(test.minQuestions || questions.length));

    setShuffledQuestions(limited);
    setTimeLeft(parseInt(test.duration || 10) * 60); // minutes to seconds
    setStarted(true);
  };

  const handleOptionChange = (index, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [index]: optionIndex }));
  };

  // ✅ Submit test
  const handleSubmit = async () => {
    if (!started || submitted) return;
    setSubmitted(true);

    const total = shuffledQuestions.length;
    let score = 0;

    shuffledQuestions.forEach((q, i) => {
      if (parseInt(q.correct) === answers[i]) {
        score++;
      }
    });

    const resultData = {
      attenderName,
      userId: user?.uid || 'anonymous',
      userEmail: user?.email || 'anonymous',
      testId,
      score,
      total,
      answers,
      submittedAt: Date.now(),
    };

    const resultRef = ref(db, `results/${testId}`);
    const newResultRef = push(resultRef);
    await set(newResultRef, resultData);

    alert(`Test Submitted!\nScore: ${score}/${total}`);
    navigate('/');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!test) return <div className="attend-container">Loading test...</div>;

  return (
    <div className="attend-container">
      {!started ? (
        <div className="start-screen">
          <h2>{test.title}</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={attenderName}
            onChange={(e) => setAttenderName(e.target.value)}
            required
          />
          <button className="start-btn" onClick={startTest}>
            Start Test
          </button>
        </div>
      ) : (
        <>
          <div className="attend-header">
            <h2>{test.title}</h2>
            <div className="timer"><FaRegClock /> Time Left: {formatTime(timeLeft)}</div>
            <p>
              Attender: <strong>{attenderName}</strong>
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {shuffledQuestions.map((q, i) => (
              <div className="question-block" key={i}>
                <p className="question">Q{i + 1}: {q.question}</p>
                <div className="options">
                  {q.options.map((opt, j) => (
                    <label key={j} className="option">
                      <input
                        type="radio"
                        name={`question-${i}`}
                        checked={answers[i] === j}
                        onChange={() => handleOptionChange(i, j)}
                      />
                      {String.fromCharCode(65 + j)}. {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button type="submit" className="submit-btn">
              Submit Test
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default AttendTest;
