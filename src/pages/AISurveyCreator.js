import React, { useState } from 'react';
import { ref, push, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import axios from 'axios';
import '../styles/AISurveyCreator.css';
import Navbar from '../components/Navbar';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const AISurveyCreator = () => {
  const [requirement, setRequirement] = useState('');
  const [questions, setQuestions] = useState([]);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [surveyId, setSurveyId] = useState('');

  const validateSurveyJSON = (data) => {
    if (!data || !data.survey || !Array.isArray(data.survey.questions)) return false;

    for (const q of data.survey.questions) {
      if (typeof q.question !== 'string') return false;
      if (!['multiple_choice', 'rating_scale'].includes(q.type)) return false;
      if (!Array.isArray(q.options)) return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setQuestions([]);
    setSurveyTitle('');
    try {
      const prompt = `You are a survey generation AI. Based on this requirement: "${requirement}", return a well-structured JSON survey with this format:
{
  "survey": {
    "title": "string",
    "questions": [
      {
        "type": "multiple_choice" | "rating_scale",
        "question": "string",
        "options": ["string", "string"]
      }
    ]
  }
}
Do not include short_answer type. Only return valid JSON.`;

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );

      const rawText = res.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonStart = rawText.indexOf('{');
      const jsonEnd = rawText.lastIndexOf('}') + 1;
      const jsonString = rawText.slice(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonString);

      if (validateSurveyJSON(parsed)) {
        setSurveyTitle(parsed.survey.title || '');
        setQuestions(parsed.survey.questions);
      } else {
        console.error('Invalid structure:', parsed);
        alert('Invalid response structure from AI.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to generate survey.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionEdit = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push('');
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        type: 'multiple_choice',
        options: [''],
      },
    ]);
  };

  const handleSaveSurvey = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert('You must be logged in to save surveys.');
        return;
      }

      const surveyRef = push(ref(db, 'surveys'));
      await set(surveyRef, {
        title: surveyTitle,
        questions,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      });

      setSurveyId(surveyRef.key);
      alert('Survey saved successfully!');
    } catch (err) {
      alert('Error saving survey: ' + err.message);
    }
  };

  const shareLink = surveyId ? `${window.location.origin}/survey/${surveyId}` : '';

  return (
    <div>
      <Navbar />
      <div className="ai-survey">
        <h2>🧠 AI Survey Creator</h2>

        <textarea
          placeholder="Enter your survey requirement..."
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
        />
        <button onClick={handleGenerate} disabled={loading || !requirement}>
          {loading ? 'Generating...' : 'Generate Survey'}
        </button>

        {surveyTitle && <h3>📋 {surveyTitle}</h3>}

        {questions.map((q, idx) => (
          <div key={idx} className="question-box">
            <input
              type="text"
              value={q.question}
              onChange={(e) => handleEdit(idx, 'question', e.target.value)}
              placeholder="Question"
            />
            <select
              value={q.type}
              onChange={(e) => handleEdit(idx, 'type', e.target.value)}
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="rating_scale">Rating Scale</option>
            </select>

            {q.options?.map((opt, i) => (
              <input
                key={i}
                type="text"
                value={opt}
                onChange={(e) => handleOptionEdit(idx, i, e.target.value)}
                placeholder={`Option ${i + 1}`}
              />
            ))}

            <button onClick={() => addOption(idx)}>➕ Add Option</button>
            <button onClick={() => removeQuestion(idx)} className="delete-btn">
              🗑️ Delete Question
            </button>
          </div>
        ))}

        <div className="bottom-actions">
          <button onClick={addQuestion}>➕ Add Question</button>
          {questions.length > 0 && (
            <button onClick={handleSaveSurvey}>💾 Save Survey</button>
          )}
        </div>

        {shareLink && (
          <div className="share-link">
            <p>📤 Share your survey:</p>
            <input type="text" readOnly value={shareLink} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AISurveyCreator;
