import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, update } from 'firebase/database';
import Navbar from './Navbar';
import { TiDeleteOutline } from "react-icons/ti";
import { IoIosAddCircleOutline } from "react-icons/io";
import { MdOutlineDelete } from "react-icons/md";
import { TfiSave } from "react-icons/tfi";
import "./EditTest.css";

const EditTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const db = getDatabase();
        const testsRef = ref(db, 'tests');
        const snapshot = await get(testsRef);

        if (snapshot.exists()) {
          const allTests = snapshot.val();

          let foundTest = null;
          let createdBy = null;

          for (const userId in allTests) {
            if (allTests[userId][testId]) {
              foundTest = allTests[userId][testId];
              createdBy = userId;
              break;
            }
          }

          if (foundTest && createdBy) {
            setTest({ ...foundTest, id: testId, createdBy });
          } else {
            alert('Test not found!');
          }
        } else {
          alert('No tests found in the database.');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching test:', err);
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  const handleInputChange = (e, questionIndex, field, optionIndex = null) => {
    const updatedQuestions = [...test.questions];

    if (field === 'question') {
      updatedQuestions[questionIndex].question = e.target.value;
    } else if (field === 'correct') {
      updatedQuestions[questionIndex].correct = Number(e.target.value);
    } else if (field === 'option') {
      updatedQuestions[questionIndex].options[optionIndex] = e.target.value;
    }

    setTest({ ...test, questions: updatedQuestions });
  };

  const addQuestion = () => {
    const newQuestion = {
      question: '',
      options: ['', '', '', ''],
      correct: 0
    };
    setTest({ ...test, questions: [...test.questions, newQuestion] });
  };

  const deleteQuestion = (index) => {
    const updatedQuestions = test.questions.filter((_, i) => i !== index);
    setTest({ ...test, questions: updatedQuestions });
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...test.questions];
    updatedQuestions[qIndex].options.push('');
    setTest({ ...test, questions: updatedQuestions });
  };

  const deleteOption = (qIndex, optIndex) => {
    const updatedQuestions = [...test.questions];
    updatedQuestions[qIndex].options.splice(optIndex, 1);
    setTest({ ...test, questions: updatedQuestions });
  };

  const handleSave = () => {
    const db = getDatabase();
    const testRef = ref(db, `tests/${test.createdBy}/${testId}`);

    update(testRef, {
      ...test
    })
      .then(() => {
        alert('Test updated successfully!');
        navigate('/dashboard');
      })
      .catch((err) => {
        console.error('Error updating test:', err);
        alert('Failed to update test');
      });
  };

  if (loading) return <p>Loading...</p>;
  if (!test) return <p>No test found.</p>;

  return (
    <div>
      <Navbar />
      <div className="edit-test-container">
        <h2>Edit Test</h2>
        {test.questions.map((q, i) => (
          <div key={i} className="question-block">
            <label>Question {i + 1}</label>
            <input
              type="text"
              value={q.question}
              onChange={(e) => handleInputChange(e, i, 'question')}
            />

            {q.options.map((opt, j) => (
              <div key={j} className="option-row">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleInputChange(e, i, 'option', j)}
                />
                {q.options.length > 2 && (
                  <button onClick={() => deleteOption(i, j)}><TiDeleteOutline /></button>
                )}
              </div>
            ))}

            <button onClick={() => addOption(i)}><IoIosAddCircleOutline /> Add Option</button>

            <label>Correct Option (Index: 0-based)</label>
            <input
              type="number"
              value={q.correct}
              onChange={(e) => handleInputChange(e, i, 'correct')}
              min="0"
              max={q.options.length - 1}
            />

            <button className="delete-btn" onClick={() => deleteQuestion(i)}><MdOutlineDelete /> Question</button>
            <hr />
          </div>
        ))}

        <button className="add-btn" onClick={addQuestion}><IoIosAddCircleOutline /> Add New Question</button>
        <br />
        <button className="save-btn" onClick={handleSave}><TfiSave /> Save Changes</button>
      </div>
    </div>
  );
};

export default EditTest;
