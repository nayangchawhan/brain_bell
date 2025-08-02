import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import '../styles/ViewResponsesPage.css';
import Navbar from '../components/Navbar';

const ViewResponsesPage = () => {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    // Fetch survey details
    const surveyRef = ref(db, `surveys/${surveyId}`);
    onValue(surveyRef, (snapshot) => {
      if (snapshot.exists()) {
        setSurvey(snapshot.val());
      }
    });

    // Fetch all responses under surveyId
    const responsesRef = ref(db, `responses/${surveyId}`);
    onValue(responsesRef, (snapshot) => {
      const allResponses = [];
      const data = snapshot.val();

      if (data) {
        Object.values(data).forEach((entry) => {
          if (Array.isArray(entry)) {
            allResponses.push(entry); // old flat format (just an array)
          } else {
            Object.values(entry).forEach((r) => {
              if (Array.isArray(r)) {
                allResponses.push(r);
              }
            });
          }
        });
      }

      setResponses(allResponses);
    });
  }, [surveyId]);

  const getOptionStats = (questionIndex, options) => {
    const counts = {};
    options.forEach(opt => counts[opt] = 0);

    responses.forEach(res => {
      const answer = res[questionIndex];
      if (counts[answer] !== undefined) {
        counts[answer]++;
      }
    });

    return counts;
  };

  return (
    <div>
        <Navbar/>
    <div className="responses-page">
      <h2>📋 Responses for: <span>{survey?.title || "Survey"}</span></h2>
      <p className="total-responses">✅ Total Responses: {responses.length}</p>

      {/* Individual Responses */}
      {responses.length === 0 ? (
        <p>No responses submitted yet.</p>
      ) : (
        <>
          <h3 className="analytics-title">📈 Overall Analysis</h3>
          {survey?.questions?.map((q, i) => {
            if (q.type === 'multiple_choice' || q.type === 'rating_scale') {
              const stats = getOptionStats(i, q.options);
              const total = responses.length || 1;

              return (
                <div key={i} className="analytics-card">
                  <h4>Q{i + 1}: {q.question}</h4>
                  {q.options.map((opt, idx) => {
                    const count = stats[opt];
                    const percentage = ((count / total) * 100).toFixed(1);
                    return (
                      <div key={idx} className="option-bar">
                        <span className="option-label">{opt}</span>
                        <div className="bar-container">
                          <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="option-stats">{percentage}% ({count} votes)</span>
                      </div>
                    );
                  })}
                </div>
              );
            } else {
              return null; // skip short_answer
            }
          })}
        </>
      )}
    </div>
    </div>
  );
};

export default ViewResponsesPage;
