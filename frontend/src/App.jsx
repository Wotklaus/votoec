import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Registro from "./pages/Registro";
import Login from "./pages/Login";
import Blockchain from "./pages/Blockchain";
import Server from "./pages/Server";
import Admin from "./pages/Admin";
import Customer from "./pages/Customer";
import React from "react";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
    
        <Route path="/blockchain" element={<Blockchain />} />
        <Route path="/server" element={<Server/>}/>
        <Route path="/admin" element={<Admin/>}/>
        <Route path="/customer" element={<Customer/>}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
