import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue, push } from 'firebase/database';
import { db } from '../firebase';

const AttendTest = () => {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [showStart, setShowStart] = useState(true);

  // Disable Right-click, F12, Reload
  useEffect(() => {
    const disable = (e) => e.preventDefault();

    const keyBlocker = (e) => {
      if (['F12', 'F5'].includes(e.key) || (e.ctrlKey && e.key === 'r')) e.preventDefault();
    };

    document.addEventListener('contextmenu', disable);
    window.addEventListener('keydown', keyBlocker);

    return () => {
      document.removeEventListener('contextmenu', disable);
      window.removeEventListener('keydown', keyBlocker);
    };
  }, []);

  useEffect(() => {
    const testRef = ref(db, `tests/${testId}`);
    onValue(testRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setTest(data);
    });
  }, [testId]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) handleSubmit();
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const startTest = () => {
    const total = parseInt(test.minQuestions || test.questions.length);
    const randomQ = shuffle(test.questions).slice(0, total);
    setQuestions(randomQ);
    setTimeLeft(parseInt(test.duration) * 60);
    setShowStart(false);
  };

  const handleOptionChange = (qIndex, selectedIndex) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: selectedIndex }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    let score = 0;
    questions.forEach((q, idx) => {
      if (parseInt(q.correct) === answers[idx]) score++;
    });

    const resultData = {
      name,
      testId,
      score,
      total: questions.length,
      submittedAt: Date.now(),
      answers,
      questions,
    };

    const resultRef = ref(db, `results/${test.createdBy}/${testId}`);
    push(resultRef, resultData);
  };

  if (!test) return <p>Loading test...</p>;

  return (
    <div className="attend-container">
      {showStart ? (
        <div className="start-screen">
          <h2>{test.title}</h2>
          <p>{test.description}</p>
          <input
            type="text"
            placeholder="Enter Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button disabled={!name.trim()} onClick={startTest}>Start Test</button>
        </div>
      ) : submitted ? (
        <div className="submitted-msg">
          <h3>Test Submitted ✅</h3>
          <p>Thank you, <strong>{name}</strong>! Your score is {questions.filter((q, i) => q.correct === answers[i]).length}/{questions.length}</p>
        </div>
      ) : (
        <div className="question-box">
          <div className="timer">⏰ {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</div>
          {questions.map((q, idx) => (
            <div key={idx} className="question">
              <p><strong>Q{idx + 1}:</strong> {q.question}</p>
              {q.options.map((opt, i) => (
                <label key={i}>
                  <input
                    type="radio"
                    name={`q${idx}`}
                    checked={answers[idx] === i}
                    onChange={() => handleOptionChange(idx, i)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}
          <button className="submit-btn" onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
};

export default AttendTest;
