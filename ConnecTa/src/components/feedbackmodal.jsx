import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

function FeedbackModal({ report, onClose }) {

  // ================= STATE =================
  const [questions, setQuestions] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);

  // ================= FETCH QUESTIONS =================
  useEffect(() => {

    const fetchQuestions = async () => {
      try {

        const res = await fetch(
          "https://connecta-backend-u4tw.onrender.com/admin/settings/feedback"
        );

        if (!res.ok) {
          console.error("Failed to fetch feedback settings");
          setLoading(false);
          return;
        }

        const data = await res.json();

        setQuestions(data?.questions || []);
        setLoading(false);

      } catch (err) {
        console.error("Error fetching questions:", err);
        setLoading(false);
      }
    };

    fetchQuestions();

  }, []);

  // ================= AVERAGE =================
  const calculateAverage = () => {
    const values = Object.values(feedback).filter(v => typeof v === "number");

    if (values.length === 0) return 0;

    const sum = values.reduce((a, b) => a + b, 0);

    return (sum / values.length).toFixed(2);
  };

  // ================= SUBMIT =================
  const submitFeedback = async () => {

    if (questions.length === 0) {
      alert("No feedback questions available.");
      return;
    }

    const unanswered = questions.some((_, index) => {
      const key = `q${index + 1}`;
      return !feedback[key];
    });

    if (unanswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    try {

      await addDoc(collection(db, "feedbacks"), {
        reportId: report?.id || null,
        responses: feedback,
        average: calculateAverage(),
        createdAt: Date.now()
      });

      onClose();

    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  // ================= UI =================
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

      {/* CONTAINER */}
      <div className="bg-white w-full max-w-lg rounded-2xl max-h-[90vh] flex flex-col shadow-xl">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div>
            <h1 className="text-lg font-bold mt-3 text-[#007CCF]">Feedback</h1>
            <p className="text-xs text-gray-500">Help us improve our service</p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-4 sm:px-6 py-4 space-y-6 flex-1">

          {/* LOADING */}
          {loading && (
            <p className="text-sm text-gray-500">Loading questions...</p>
          )}

          {/* NO QUESTIONS */}
          {!loading && questions.length === 0 && (
            <p className="text-sm text-gray-500">
              No feedback questions found.
            </p>
          )}

          {/* QUESTIONS */}
          {!loading && questions.map((qText, index) => {

            const key = `q${index + 1}`;

            return (
              <div key={index}>

                <p className="text-sm font-medium text-gray-700 mb-2">
                  {qText}
                </p>

                <div className="flex flex-col gap-2">

                  {/* LABELS */}
                  <div className="flex justify-between text-xs text-gray-500 px-1">
                    <span>Poor</span>
                    <span>Fair</span>
                    <span>Good</span>
                    <span>Very Good</span>
                    <span>Excellent</span>
                  </div>

                  {/* BUTTONS */}
                  <div className="flex justify-between">

                    {[1, 2, 3, 4, 5].map((rate) => (

                      <button
                        key={rate}
                        onClick={() =>
                          setFeedback(prev => ({
                            ...prev,
                            [key]: rate
                          }))
                        }
                        className={`w-10 h-10 rounded-full border text-sm font-medium
                          ${feedback[key] === rate
                            ? "bg-[#007CCF] text-white border-[#007CCF]"
                            : "bg-white text-gray-600 border-gray-300"}
                        `}
                      >
                        {rate}
                      </button>

                    ))}

                  </div>

                </div>

              </div>
            );
          })}

          {/* AVERAGE */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-[#007CCF] font-medium">
            Average Rating: {calculateAverage()}
          </div>

          {/* COMMENT */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Additional Comments
            </p>

            <textarea
              placeholder="Write your feedback..."
              onChange={(e) =>
                setFeedback(prev => ({
                  ...prev,
                  comment: e.target.value
                }))
              }
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#007CCF]"
              rows="4"
            />
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 flex gap-3">

          <button
            onClick={onClose}
            className="flex-1 border rounded-lg py-2 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={submitFeedback}
            className="flex-1 bg-[#007CCF] text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Submit
          </button>

        </div>

      </div>
    </div>
  );
}

export default FeedbackModal;