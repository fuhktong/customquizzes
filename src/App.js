import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./home/home.js";
import Header from "./header/header";
import Definitions from "./definitions/definitions.js";
import Descriptions from "./descriptions/descriptions.js";
import Names from "./names/names.js";
import QuizInput from "./quizinput/quizinput.js";

function App() {
  const location = useLocation();

  return (
    <div className="App">
      <Header />
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="quiz-maker" element={<QuizInput />} />
        <Route path="definitions" element={<Definitions />} />
        <Route path="descriptions" element={<Descriptions />} />
        <Route path="names" element={<Names />} />
      </Routes>
    </div>
  );
}

export default App;
