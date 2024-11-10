import React, { useState } from "react";
import "../styles/BrokenAuth.css";
import { useNavigate } from "react-router-dom";

/**
 * Prikaz stranice za demonstraciju lose autentifikacije
 * @returns prikaz stranice
 */
export function BrokenAuth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId"));
    const [lockout, setLockout] = useState(false);
    const [brokenAuthCheckbox, setBrokenAuthCheckbox] = useState(false);
    const navigate = useNavigate();

    /**
     * Funkcija koja obraduje prijavu korisnika za losu autentifikaciju
     *
     * @param {React.FormEvent<HTMLFormElement>} e - slanje forme
     */
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Provjerava postoji li privremena blokada prijave.
        if (lockout) {
            alert("You are temporarily locked out. Please try again in 30 seconds.");
            return;
        }
        //POST zahtjev na server
        try {
            const response = await fetch("https://nrppzw-xlwz.onrender.com/loginBrokenAuth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, brokenAuthCheckbox }),
            });
            const data = await response.json();

            //sprema sessionid ako je prijava uspjesna, inace privremena blokada prijave
            if (data.sessionId) {
                if (brokenAuthCheckbox) {
                    localStorage.setItem("sessionId", data.sessionId);
                }
                setSessionId(data.sessionId);
                alert(`Logged in successfully with ${brokenAuthCheckbox ? "broken" : "secure"} authentication.`);
            } else if (data.message === "Too many attempts. Try again after 30 seconds.") {
                setLockout(true);
                alert("Too many attempts. You are locked out for 30 seconds.");

                setTimeout(() => {
                    setLockout(false);
                }, 30000);
            } else {
                alert(data.message || "Login failed");
            }
        } catch (error) {
            console.error("Error logging in:", error);
            alert("Login failed due to an error.");
        }
    };

    return (
        <div className="container2">
            <div className="broken-auth-types-navigation">
                <h2>Loša autentifikacija</h2>
            </div>
            <div className="broken-auth-types-section">
                <div className="tUpute2">
                    <h2>Upute za prijavu</h2>
                    <p>
                        Ovaj sustav podržava dva načina prijave: siguran i nesiguran način prijave.
                    </p>

                    <h3>Nesigurna prijava</h3>
                    <p>Upute za nesigurnu prijavu:</p>
                    <ul>
                        <li>Odabrati nesigurnu prijavu u dijelu "Dozvoli lošu autentifikaciju (nesigurno)" </li>
                        <li><strong>Email:</strong> test@example.com</li>
                        <li><strong>Lozinka:</strong> test</li>
                    </ul>
                    <p>
                        Nakon uspješne prijave ponovno se prijaviti koristeći SQL injection:
                    </p>
                    <ul>
                        <li><strong>Email:</strong> ana.kovacevic@example.com' OR '1'='1</li>
                        <li><strong>Lozinka:</strong> bilosto</li>
                    </ul>
                    <p>
                        Ova vrsta prijave nije sigurna i omogućava napadačima da zaobiđu autentifikaciju.
                        To je zbog toga što se sustav oslanja na nesanitizirane ulaze, dodatno, ne koriste se parametri prilikom upita u bazu podataka, koristi se nesigurni session id s md5 te se session ID sprema za demonstracijske svrhe u localstorage.
                        Također, u ovom su slučaju lozinke korisnika nesigurno spremljene u bazu podataka u običnom tekstu čime su podložni brute force napadima.
                        U nesigurnoj implementaciji nema blokiranja korisnika nakon određenog broja neuspješnih prijava.
                    </p>

                    <h3>Sigurna prijava</h3>
                    <p>Upute za sigurnu prijavu:</p>
                    <ul>
                        <li><strong>Email:</strong> ivan@example.com</li>
                        <li><strong>Lozinka:</strong> brokenAuthSecure</li>
                    </ul>
                    <p>
                        Nakon uspješne prijave, sigurnost sustava može se provjeriti tako da se pokuša izvršiti isti SQL injection napad kada je opcija "Dozvoli lošu autentifikaciju" isključena:
                    </p>
                    <ul>
                        <li><strong>Email:</strong> ivan@example.com' OR '1'='1</li>
                        <li><strong>Lozinka:</strong> bilosto</li>
                    </ul>
                    <p>
                        U sigurnoj verziji, napadi poput ovog neće uspjeti jer sustav koristi sigurnije mehanizme autentifikacije.
                        Ovdje se koriste parametarski upiti i provjera lozinki, također, ovaj se korisnik dodao naknadno u bazu te je primjer kako bi se korisnici trebali dodavati pri čemu lozinka nije u formatu običnog teksta, nego je pomoću bcrypt funkcije dodatno osigurana i spremljena u bazu podataka.
                        Osim toga, nakon tri neuspješne prijave, korisnik se blokira na 30 sekundi u demonstracijske svrhe u kojima se ne može prijavljivati.
                    </p>
                </div>
                <div className="post2">
                    <h2>Login forma</h2>
                    <div className="content2">
                        <form onSubmit={handleLogin} className="broken-auth-feedback-form">
                            <div className="input-field">
                                <input
                                    type="text"
                                    placeholder=" "
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ width: '50%' }}
                                />
                                <label>Email:</label>
                            </div>

                            <div className="input-field">
                                <input
                                    type="password"
                                    placeholder=" "
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ width: '50%' }}
                                />
                                <label>Lozinka:</label>
                            </div>

                            <div className="input-field">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={brokenAuthCheckbox}
                                        onChange={() => setBrokenAuthCheckbox(!brokenAuthCheckbox)}
                                    />
                                    Dozvoli lošu autentifikaciju (nesigurno)
                                </label>
                            </div>

                            <button type="submit" disabled={lockout}>
                                Login {brokenAuthCheckbox ? "(nesigurno)" : "(sigurno)"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default BrokenAuth;