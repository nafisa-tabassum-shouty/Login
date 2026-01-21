const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'testuser@example.com';
const OTP = '928827'; // FROM THE PREVIOUS OUTPUT
const NEW_PASSWORD = 'newpassword123';

async function verifyReset() {
    try {
        console.log('--- Continuing Verification: OTP and Reset ---');

        // 1. Verify OTP
        console.log(`Step 3: Verifying OTP ${OTP}...`);
        const verifyRes = await axios.post(`${BASE_URL}/verify-otp`, {
            email: TEST_EMAIL,
            otp: OTP
        });
        console.log('OTP verification successful:', verifyRes.data);

        // 2. Reset Password
        console.log('\nStep 4: Resetting password...');
        const resetRes = await axios.post(`${BASE_URL}/reset-password`, {
            email: TEST_EMAIL,
            otp: OTP,
            password: NEW_PASSWORD
        });
        console.log('Password reset successful:', resetRes.data);

        // 3. Try logging in with the NEW password
        console.log('\nStep 5: Verifying login with NEW password...');
        const loginRes = await axios.post(`${BASE_URL}/login`, {
            email: TEST_EMAIL,
            password: NEW_PASSWORD
        });
        console.log('Login result:', loginRes.data);

    } catch (err) {
        console.error('Error during verification:', err.status || err.message);
        if (err.response) console.error('Response data:', err.response.data);
    }
}

verifyReset();
