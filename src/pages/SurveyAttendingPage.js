import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue, push } from 'firebase/database';
import { db } from '../firebase';
import '../styles/SurveyAttendingPage.css';

const SurveyAttendingPage = () => {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const surveyRef = ref(db, `surveys/${surveyId}`);
    onValue(surveyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setSurvey(data);
      else setSurvey(null);
    });
  }, [surveyId]);

  const handleChange = (qIndex, value) => {
    setResponses((prev) => ({ ...prev, [qIndex]: value }));
  };

  const handleSubmit = async () => {
    try {
      await push(ref(db, `responses/${surveyId}`), responses);
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit response: ' + err.message);
    }
  };

  if (survey === null) {
    return <p className="center">Loading or Invalid Survey ID...</p>;
  }

  if (submitted) {
    return <p className="center">✅ Thank you for completing the survey!</p>;
  }

  return (
    <div className="survey-attend">
      <h2>{survey.title}</h2>
      {survey.questions?.map((q, index) => (
        <div className="question" key={index} style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
          <label>{q.question}</label>

          {q.type === 'short_answer' && (
            <input
              type="text"
              value={responses[index] || ''}
              onChange={(e) => handleChange(index, e.target.value)}
            />
          )}

          {q.type === 'multiple_choice' && q.options?.map((opt, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', justifyContent: 'space-between' , border: '1px solid #ccc', padding: '8px', borderRadius: '4px'}}>
              {opt}
              <input
                type="radio"
                name={`question-${index}`}
                value={opt}
                checked={responses[index] === opt}
                onChange={() => handleChange(index, opt)}
              />
            </label>
          ))}

          {q.type === 'rating_scale' && (
            <select
              value={responses[index] || ''}
              onChange={(e) => handleChange(index, e.target.value)}
            >
              <option value="">Select rating</option>
              {q.options?.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          )}
        </div>
      ))}

      <button onClick={handleSubmit} className="submit-btn">Submit Survey</button>
    </div>
  );
};

export default SurveyAttendingPage;
