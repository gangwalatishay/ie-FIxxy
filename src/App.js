// app.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

const ravi400 = ["Longest Palindromic Substring", "Merge Intervals","Add to Array-Form of Integer","Third Maximum Number","Check if Array Is Sorted and Rotated","Majority Element","Matrix Similarity After Cyclic Shifts","Reorder an array according to given indexes","Replace Elements with Greatest Element on Right Side","Find the Value of the Partition","Rotate Array","Multiply Matrices","Longest Mountain in Array","Minimum Adjacent Swaps to Make a Valid Array","Number of Adjacent Elements With the Same Color","Minimize Length of Array Using Operations","Set Matrix Zeroes","First Missing Positive","Minimize String Length","Check if One String Swap Can Make Strings Equal","Maximum Nesting Depth of the Parentheses","Find smallest number formed by inserting given digit","String Compression","Encode and Decode Strings","Lexicographically Smallest String After Substring Operation","Minimum Additions to Make Valid String","Largest Palindromic Number","Find Beautiful Indices in the Given Array II","Guess the Word","Text Justification","Find the Index of the First Occurrence in a String","Repeated String Match","Shortest Palindrome","Two Sum","Intersection of Two Arrays II","First Unique Character in a String","Design HashMap","Roman to Integer","Count Triplets That Can Form Two Arrays of Equal XOR","Unique Length-3 Palindromic Subsequences","Find the Number of Distinct Colors Among the Balls","Insert Delete GetRandom O(1)","Minimum Number of Pushes to Type Word II","Max Sum of a Pair With Equal Sum of Digits","Check If Array Pairs Are Divisible by k","Pairs of Songs With Total Durations Divisible by 60","Design a Number Container System","Sum of Distances","Sum of Matrix After Queries","Split Array into Consecutive Subsequences","Group Anagrams","Longest Consecutive Sequence","Count Array Pairs Divisible by K","Happy Number","Pascal's Triangle","Excel Sheet Column Title","Can Make Arithmetic Progression From Sequence","Maximum GCD Pair","Nth catalan number","Minimum Operations to Make Array Equal","Minimum Moves to Equal Array Elements","Rotate Image","Multiply Strings","Detect Squares","Minimum Number of Operations to Make All Array Elements Equal to 1","Count Good Numbers","Check if Point Is Reachable","Count All Valid Pickup and Delivery Options","Maximum Score After Splitting a String","Product of Array Except Self","Range Sum Query 2D - Immutable","Minimum Penalty for a Shop","Minimum Number of Operations to Move All Balls to Each Box","Movement of Robots","Grid Game","Number of Submatrices That Sum to Target"];

const languageOptions = ["C++", "Python", "Java", "JavaScript"];
const tasks = ["Explain", "Debug", "TestCases"];

function App() {
  const [theme, setTheme] = useState("light");
  const [selectedSet, setSelectedSet] = useState("Ravi 400");
  const [searchTerm, setSearchTerm] = useState("");
  const [questions, setQuestions] = useState(ravi400);
  const [selectedQuestion, setSelectedQuestion] = useState({ Explain: "", Debug: "", TestCases: "" });
  const [language, setLanguage] = useState("Python");
  const [task, setTask] = useState("Explain");
  const [code, setCode] = useState({ Explain: "", Debug: "", TestCases: "" });
  const [chat, setChat] = useState({ Explain: [], Debug: [], TestCases: [] });
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Cursor setup
    const cursor = document.querySelector(".custom-cursor");
    const moveCursor = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };
    const shrinkOnClick = () => {
      cursor.classList.add("clicking");
      setTimeout(() => cursor.classList.remove("clicking"), 400);
    };
    const fadeCursor = () => {
      cursor.style.opacity = "1";
      clearTimeout(cursor._idleTimer);
      cursor._idleTimer = setTimeout(() => {
        cursor.style.opacity = "0";
      }, 3000);
    };
    const expandOnHover = (e) => {
      if (["BUTTON", "A", "INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
        cursor.classList.add("hovering");
      }
    };
    const shrinkOnLeave = () => {
      cursor.classList.remove("hovering");
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousemove", fadeCursor);
    window.addEventListener("mousedown", shrinkOnClick);
    window.addEventListener("mouseover", expandOnHover);
    window.addEventListener("mouseout", shrinkOnLeave);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousemove", fadeCursor);
      window.removeEventListener("mousedown", shrinkOnClick);
      window.removeEventListener("mouseover", expandOnHover);
      window.removeEventListener("mouseout", shrinkOnLeave);
    };
  }, []);

  useEffect(() => {
    if (selectedSet === "Ravi 400") setQuestions(ravi400);

    setSearchTerm("");
  }, [selectedSet]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSubmit = useCallback(async () => {
    const currentInput = task === "Debug" ? code[task] : selectedQuestion[task];
    if (!currentInput) {
      alert("Please select a question from sheet or enter a DSA question.");
      return;
    }

    setChat((prev) => ({
      ...prev,
      [task]: [...prev[task], { from: "user", text: currentInput, language, task }],
    }));

    setLoading(true);
    try {
      const res = await fetch("https://ie-fixxy-1.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          question: selectedQuestion[task],
          language,
          code: code[task],
        }),
      });
      const data = await res.json();
      setChat((prev) => ({
        ...prev,
        [task]: [...prev[task], { from: "bot", text: data.answer, task }],
      }));
    } catch {
      setChat((prev) => ({
        ...prev,
        [task]: [...prev[task], { from: "bot", text: "Error: Unable to fetch response." }],
      }));
    }
    setLoading(false);
  }, [task, selectedQuestion, code, language]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit]);

  const filteredQuestions = questions.filter((q) =>
    q.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className={`app-layout ${theme}`} data-theme={theme}>
      <div className="custom-cursor" />
      <aside
        className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}
        style={{
          overflowY: "auto",
          maxHeight: "100vh",
          width: isSidebarOpen ? "250px" : "0",
          transition: "width 0.3s ease, padding 0.3s ease",
          padding: isSidebarOpen ? "1rem" : "0",
          borderRight: isSidebarOpen ? "1px solid #ccc" : "none",
        }}
      >
        {isSidebarOpen && (
          <>
            <h2>Ravi DSA Sheets</h2>
            <div className="ravi-sets">
              {[ "Ravi 400"].map((set) => (
                <button
                  key={set}
                  className={`ravi-set-btn ${selectedSet === set ? "selected" : ""}`}
                  onClick={() => setSelectedSet(set)}
                >
                  {set}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <ul className="question-list">
              {filteredQuestions.map((q) => (
                <li
                  key={q}
                  className={q === selectedQuestion[task] ? "selected" : ""}
                  onClick={() => {
                    setSelectedQuestion((prev) => ({ ...prev, [task]: q }));
                    setCode((prev) => ({ ...prev, [task]: "" }));
                  }}
                >
                  {q}
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>

      <main className="container">
        <header className="header">
          <button className="hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
          <div className="controls">
            <label>
              Task:
              <select value={task} onChange={(e) => setTask(e.target.value)}>
                {tasks.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            {task !== "Explain" && (
              <label>
                Language:
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {languageOptions.map((lang) => (
                    <option key={lang}>{lang}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <button onClick={toggleTheme} className="dark-toggle-btn">
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </header>

        {task !== "Debug" && (
          <section className="question-entry">
            <label htmlFor="custom-question">Type your DSA question:</label>
            <textarea
              id="custom-question"
              rows="4"
              value={selectedQuestion[task]}
              onChange={(e) => setSelectedQuestion((prev) => ({ ...prev, [task]: e.target.value }))}
              placeholder="Enter your DSA question"
            />
          </section>
        )}

        {task === "Debug" && (
          <section className="debug-section">
            <label>Paste your code:</label>
            <textarea
              rows="10"
              value={code[task]}
              onChange={(e) => setCode((prev) => ({ ...prev, [task]: e.target.value }))}
              placeholder="Enter or paste buggy code here..."
            />
          </section>
        )}

        <section className="chat-section">
          <div className="chat-window" style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {chat[task].map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.from === "user" ? "user-msg" : "bot-msg"}`}
              >
                <div className="msg-task">{msg.task}</div>
                <pre className="msg-text">
                  {msg.from === "bot" && idx === chat[task].length - 1 && !loading
                    ? <Typewriter text={msg.text} />
                    : msg.text}
                </pre>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="button-row">
            <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Loading..." : "Send"}
            </button>
            <button className="clear-btn" onClick={() => setChat((prev) => ({ ...prev, [task]: [] }))}>
              Clear
            </button>
            <button className="reset-btn" onClick={() => {
              setSelectedQuestion((prev) => ({ ...prev, [task]: "" }));
              setCode((prev) => ({ ...prev, [task]: "" }));
            }}>
              Reset
            </button>
            <button className="info-btn" onClick={() => alert("Powered by IE Navi AI")}>
              Info
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Typewriter({ text }) {
  const [displayed, setDisplayed] = useState("");
  const index = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[index.current]);
      index.current += 1;
      if (index.current >= text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text]);
  return <>{displayed}</>;
}

export default App;
