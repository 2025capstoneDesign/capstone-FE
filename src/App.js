import MainPage from "./MainPage";
import LoginPage from "./LoginPage"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import ResultPage from "./ResultPage";

function App(){
  return(
    <BrowserRouter>
    <div className="APP">
      <Routes>
        <Route exact path="/" element={<MainPage/>}/>
        <Route exact path="/login" element={<LoginPage/>}/>
        <Route exact path="/result" element={<ResultPage/>}/>
      </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App;