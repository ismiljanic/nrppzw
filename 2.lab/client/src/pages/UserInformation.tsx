import React from 'react';
import { useLocation } from 'react-router-dom';
import "../styles/UserInformation.css";

export interface User {
    id: number;
    email: string;
    name: string;
}

/**
 * Stranica korisnika na kojoj se prikazuju informacije o korisniku
 * @returns prikaz stranice korisnika
 */
export function UserInformation(): JSX.Element {
    const location = useLocation();
    
    const user: User | undefined = location.state?.user;

    return (
        <div className="page">
            <h1>Informacije korisnika</h1>
            {user ? (
                <div className="user-info">
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Ime:</strong> {user.name}</p>
                </div>
            ) : (
                <p>No user information available.</p>
            )}
        </div>
    );
}

export default UserInformation;
