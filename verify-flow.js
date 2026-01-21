const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'testuser@example.com';
const TEST_PASSWORD = 'password123';
const NEW_PASSWORD = 'newpassword123';

async function verifyFlow() {
    try {
        console.log('--- Starting Forgot Password Flow Verification ---');

        // 1. Register User (if not exist)
        console.log('Step 1: Registering user...');
        try {
            await axios.post(`${BASE_URL}/register`, {
                fullName: 'Test User',
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });
            console.log('User registered.');
        } catch (err) {
            console.log('User might already exist (Status: ' + err.response?.status + ')');
        }

        // 2. Forgot Password Request
        console.log('\nStep 2: Requesting forgot password...');
        const forgotRes = await axios.post(`${BASE_URL}/forgot-password`, { email: TEST_EMAIL });
        console.log('Forgot password request successful:', forgotRes.data);

        // Since we are using mock email, we'll have to check the console for the OTP.
        // But for this script, I'll simulate finding it if I could read the console or DB.
        // Actually, since I'm running this, I'll check the terminal output of the server.

        console.log('\n[ACTION REQUIRED]: Check the server terminal for the 6-digit OTP code.');
        console.log('Then, run the second part of this script with the OTP.');

    } catch (err) {
        console.error('Error during verification:', err.message);
        if (err.response) console.error('Response data:', err.response.data);
    }
}

verifyFlow();
