import { Route, Routes } from "react-router-dom";
import HomePage from "./home/home.js";
import Header from "./header/header";
import Definitions from "./definitions/definitions.js";
import Descriptions from "./descriptions/descriptions.js";
import Names from "./names/names.js";
import QuizMaker from "./quizmaker/quizmaker.js";
import QuizInterface from "./quizinterface/quizinterface.js";
import LandingNames from "./landing/landing-names.js";
import LandingDescriptions from "./landing/landing-descriptions.js";
import Login from "./auth/login.js";
import Register from "./auth/register.js";
import { AuthProvider } from "./context/authcontext.js";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="quiz-interface" element={<QuizInterface />} />
          <Route path="quiz-maker" element={<QuizMaker />} />
          <Route path="definitions" element={<Definitions />} />
          <Route path="landing-names" element={<LandingNames />} />
          <Route path="names" element={<Names />} />
          <Route
            path="landing-descriptions"
            element={<LandingDescriptions />}
          />
          <Route path="descriptions" element={<Descriptions />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
