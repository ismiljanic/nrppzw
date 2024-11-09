import React, { useState } from "react";
import "../styles/Injection.css";
import { useNavigate } from "react-router-dom";

/**
 * Prikaz stranice za demonstraciju SQL injectiona
 * @returns prikaz stranice
 */
export function SQLInjection() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userId, setUserId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sqlInjectionCheckbox, setSqlInjectionCheckbox] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [changeEmail, setChangeEmail] = useState('');
    const [changePassword, setChangePassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const navigate = useNavigate();

    const smoothScroll = (event: { preventDefault: () => void; }, targetId: string) => {
        event.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: "smooth" });
        }
    };

    /**
     * Funkcija koja obraduje prijavu korisnika za SQL injection
     * 
     * @param {React.FormEvent<HTMLFormElement>} e - slanje forme
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        //Slanje POST zahtjeva s podacima na server
        try {
            const response = await fetch("https://nrppzwlab2backend.onrender.com/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    sqlInjectionCheckbox
                }),
            });
            //neuspjeh
            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || "Invalid email or password");
                setUserInfo(null);
                return;
            }
            //uspjesna prijava sprema korisnicke podatke i preusmjerava na stranicu s informacijama o korisniku
            const data = await response.json();
            setUserInfo(data.user);
            setError(null);
            navigate("/userInformation", { state: { user: data.user } });
        } catch (err) {
            console.error("Login error:", err);
            alert(err || "An unexpected error occurred.");
            setUserInfo(null);
        }
    };

    /**
     * Funkcija za pretragu korisnickih podataka.
     * 
     * @param {Object} event - sprjecavanje defaultnog ponasanja forme
     */
    const handleSearch = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        //Slanje GET zahtjeva s pojmom za pretrazivanje na server
        try {
            const response = await fetch(`https://nrppzwlab2backend.onrender.com/search?term=${encodeURIComponent(searchTerm)}&sqlInjectionCheckbox=${sqlInjectionCheckbox}`);
            const data = await response.json();
            //uspjeh
            if (response.ok) {
                if (data.length > 0) {
                    alert(`Search Results: ${JSON.stringify(data)}`);
                } else {
                    alert('No results found');
                }
                //neuspjeh
            } else {
                alert(data.message || 'Error during search');
            }
        } catch (error) {
            console.error('Error during search:', error);
            alert('Error during search');
        }
    };
    /**
     * Funkcija za promjenu korisnicke lozinke.
     * 
     * @param {React.FormEvent<HTMLFormElement>} event - slanje forme
     */
    const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        //Slanje POST zahtjeva za promjenu lozinke na server
        try {
            const response = await fetch("https://nrppzwlab2backend.onrender.com/changePassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: changeEmail,
                    currentPassword,
                    newPassword: changePassword,
                    sqlInjectionCheckbox
                }),
            });
            //neuspjeh
            if (!response.ok) {
                throw new Error("Error changing password");
            }
            //uspjesna promjena lozinke
            alert("Password changed successfully.");
            setChangeEmail('');
            setChangePassword('');
            setCurrentPassword('');
        } catch (err) {
            console.error(err);
            alert("An error occurred while changing password.");
        }
    };


    return (
        <div className="container">
            <div className="sql-types-navigation">
                <h2>SQL Injection</h2>
                <ul className="sql-types-list">
                    <li><a href="#tautology" onClick={(e) => smoothScroll(e, 'tautology')}>Tautologija</a></li>
                    <li><a href="#illegal-queries" onClick={(e) => smoothScroll(e, 'illegal-queries')}>Ilegalni upiti</a></li>
                </ul>
            </div>

            <div className="sql-types-section" id="tautology">
                <div className="post">
                    <h2>Tautologija</h2>
                    <div className="content">
                        <div className="tUpute">
                            <b>Upute</b>
                            <br></br>
                            Ovaj primjer demonstrira SQL injection napad tautologijom. Sustav podržava dvije prijave, sigurnu i nesigurnu prijavu određenu odabirom checkboxa.
                            Za nesigurnu prijavu možete upisati korisnika: <b>test@example.com' OR '1'='1</b> i za lozinku bilo što i uspješnom prijavom ćete otići na stranicu korisnika.
                            Sigurna prijava koristi sanitizaciju korisničkog unosa te parametrizirane upite čime se ovakvi napadi onemogućavaju. Za sigurnu prijavu možete koristiti korisnika: <b>test@example.com</b> i lozinku <b>test</b>
                        </div>
                        <h3>Test forma</h3>
                        <form onSubmit={handleSubmit} className="injection-feedback-form">
                            <div className="input-field">
                                <input
                                    type="text"
                                    id="email1"
                                    name="email"
                                    placeholder=" "
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label htmlFor="email">Email:</label>
                            </div>

                            <div className="input-field">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder=" "
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label htmlFor="password">Lozinka:</label>
                            </div>


                            <div className="input-field">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        id="sqlInjectionCheckbox1"
                                        name="sqlInjectionCheckbox"
                                        checked={sqlInjectionCheckbox}
                                        onChange={() => setSqlInjectionCheckbox(!sqlInjectionCheckbox)}
                                    />
                                    Dozvoli SQL injection
                                </label>
                            </div>

                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
            {/* anything' OR '1'='1 */}
            <div className="sql-types-section" id="second-order">
                <div className="post">
                    <h2>Tautologija</h2>
                    <div className="content">
                        <div className="tUpute">
                            <b>Upute</b>
                            <br></br>
                            Drugi primjer tautologije demonstrira mogućnost promjene lozinke za prijavljenog korisnika. U slučaju nesigurne prijave, korisnik može za neki drugi korisnički račun, u slučaju da poznaje njegov email, promijeniti lozinku na bilo što drugo.
                            Primjer: Korisnik <b>test@example.com</b> i trenutna lozinka <b>anything' OR '1'='1</b> i nova lozinka na bilo što promijenit će za ovog korisnika lozinku.
                            Uspješnu prijavu možete testirati s gornjim primjerom tautologije.
                        </div>

                        <h3>Promjena lozinke</h3>
                        <form onSubmit={handleChangePassword} className="injection-feedback-form">
                            <div className="input-field">
                                <input
                                    type="text"
                                    placeholder=""
                                    value={changeEmail}
                                    onChange={(e) => setChangeEmail(e.target.value)}
                                    required
                                />
                                <label htmlFor="changeEmail">User Email</label>
                            </div>

                            <div className="input-field">
                                <input
                                    type="password"
                                    placeholder=""
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                                <label htmlFor="currentPassword">Trenutna lozinka</label>
                            </div>

                            <div className="input-field">
                                <input
                                    type="password"
                                    placeholder=""
                                    value={changePassword}
                                    onChange={(e) => setChangePassword(e.target.value)}
                                    required
                                />
                                <label htmlFor="changePassword">Nova lozinka</label>
                            </div>

                            <div className="input-field">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        id="sqlInjectionCheckboxChange"
                                        checked={sqlInjectionCheckbox}
                                        onChange={() => setSqlInjectionCheckbox(!sqlInjectionCheckbox)}
                                    />
                                    Dozvoli SQL injection
                                </label>
                            </div>

                            <button type="submit">Promijeni lozinku</button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="sql-types-section" id="illegal-queries">
                <div className="post">
                    <h2>Ilegalni upiti</h2>
                    <div className="content">
                        <div className="tUpute">
                            <b>Upute</b>
                            <br></br>
                            Ovaj primjer demonstrira ilegalne upite kroz formu pretraživanja pojma.
                            Pojam može pretraživati bilo što iz baze podataka, ali u ovom je slučaju pojam ograničen na bazu s tablicom users.
                            Forma služi isključivo kako bi se demonstriala neispravna implementacija sigurnosnih mehanizama.
                            Primjer upita kojim možete provjeriti neispravnu implementaciju:
                            <code><b>"' UNION SELECT * FROM users --"</b> </code>
                            Ovim se upitom prikazuju svi korisnici iz baze podataka tablice users. Sigurna prijava koristi sanitizaciju korisničkog unosa i parametrizirane upite.
                        </div>

                        <h3>Search Form</h3>
                        <form onSubmit={handleSearch} className="injection-feedback-form">
                            <div className="input-field">
                                <input
                                    type="text"
                                    id="searchTerm"
                                    name="searchTerm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder=""
                                    required
                                />
                                {/* "' UNION SELECT * FROM users --" */}
                                <label htmlFor="searchTerm">Traži pojam</label>
                            </div>

                            <div className="input-field">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        id="sqlInjectionCheckbox"
                                        checked={sqlInjectionCheckbox}
                                        onChange={() => setSqlInjectionCheckbox(!sqlInjectionCheckbox)}
                                    />
                                    Dozvoli SQL injection
                                </label>
                            </div>

                            <button type="submit">Traži</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SQLInjection;
