import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ChangeMail = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const submitEmail = async (e) => {
        e.preventDefault();
        if (!EMAIL_REGEX.test(email)) {
            setError('Invalid email format.');
            return;
        }

        await axiosInstance.post('/user/change-email', {email}, {withCredentials: true})
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.error(err);
            });
    };





    return (
        <div>
            <h1>Change Mail</h1>
            <form onSubmit={submitEmail}>
                <label htmlFor="email">New Email:</label>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} />
                <button type="submit">Change Email</button>
            </form>
        </div>
    );
}

export default ChangeMail;