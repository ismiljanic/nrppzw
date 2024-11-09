import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainPage.css";

/**
 * Glavna stranica za prikaz
 * @returns prikaz glavne stranice
 */

export function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="main-page">
      <header className="header">
        <h1>Druga laboratorijska vježba</h1>
        <p>SQL injection i loša autentifikacija</p>
      </header>

      <div className="test-categories">
        <div className="category-card">
          <h2>SQL Injection</h2>
          <button onClick={() => navigate('/sql-injection-test')}><span>Start Test</span></button>
        </div>

        <div className="category-card">
          <h2>Loša autentifikacija</h2>
          <button onClick={() => navigate('/broken-auth-test')}><span>Start Test</span></button>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
