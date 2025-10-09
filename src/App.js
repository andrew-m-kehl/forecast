import './App.css';

//import { BrowserRouter, Routes, Route} from 'react-router-dom';
import {useState} from 'react';
import Home from './components/homepage';
import { HashRouter, Routes, Route} from 'react-router-dom';



function App() {
  
  return (
    <div className="App">

      <HashRouter>        
        
          <main>
            <section>
              <Routes>   
                <Route path="/" element={<Home/>}/>
 
              </Routes>
            </section>
          </main>
      </HashRouter>
    </div>
  );
}

export default App;
