// src/components/CreateTest.js
import React, { useState } from 'react';
import './CreateTest.css';
import { db, auth } from '../firebase';
import { ref, push } from 'firebase/database';

const CreateTest = () => {
  const [testTitle, setTestTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [minQuestions, setMinQuestions] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correct: 0 }
  ]);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'question') {
      newQuestions[index].question = value;
    } else {
      newQuestions[index].options[field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleCorrectOptionChange = (index, correctIndex) => {
    const newQuestions = [...questions];
    newQuestions[index].correct = correctIndex;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correct: 0 }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser?.uid;
    if (!uid) return alert("Please login first");

    if (parseInt(minQuestions) > questions.length) {
      alert("Minimum number of questions cannot be more than total questions");
      return;
    }

    const testData = {
      title: testTitle,
      description,
      duration,
      minQuestions: parseInt(minQuestions),
      questions,
      createdBy: uid,
      createdAt: Date.now()
    };

    await push(ref(db, `tests/${uid}`), testData);
    alert("Test created successfully!");
    
    // Reset form
    setTestTitle('');
    setDescription('');
    setDuration('');
    setMinQuestions('');
    setQuestions([{ question: '', options: ['', '', '', ''], correct: 0 }]);
  };

  return (
    <div className="create-test-container">
      <h2>Create a New Test</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Test Title"
          value={testTitle}
          onChange={(e) => setTestTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Test Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Test Duration in minutes"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Minimum Questions to be Asked"
          value={minQuestions}
          onChange={(e) => setMinQuestions(e.target.value)}
          required
        />

        {questions.map((q, i) => (
          <div className="question-block" key={i}>
            <input
              type="text"
              placeholder={`Question ${i + 1}`}
              value={q.question}
              onChange={(e) => handleQuestionChange(i, 'question', e.target.value)}
              required
            />
            {q.options.map((opt, j) => (
              <div key={j} className="option-input">
                <input
                  type="text"
                  placeholder={`Option ${j + 1}`}
                  value={opt}
                  onChange={(e) => handleQuestionChange(i, j, e.target.value)}
                  required
                />
                <input
                  type="radio"
                  name={`correct-${i}`}
                  checked={q.correct === j}
                  onChange={() => handleCorrectOptionChange(i, j)}
                  title="Correct answer"
                />
              </div>
            ))}
          </div>
        ))}

        <button type="button" className="add-btn" onClick={addQuestion}>
          ➕ Add Question
        </button>

        <button type="submit" className="submit-btn">
          ✅ Create Test
        </button>
      </form>
    </div>
  );
};

export default CreateTest;
