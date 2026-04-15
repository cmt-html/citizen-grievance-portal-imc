const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function test() {
    try {
        console.log("Registering user...");
        const regRes = await axios.post('https://citizen-grievance-backend.vercel.app/api/auth/register', {
            name: "Test User",
            mobileNumber: "9999999999",
            password: "password123",
            role: "citizen"
        }).catch(err => err.response);

        console.log("Login user...");
        const loginRes = await axios.post('https://citizen-grievance-backend.vercel.app/api/auth/login', {
            identifier: "9999999999",
            password: "password123"
        });
        const token = loginRes.data.token;
        console.log("Received token", token);

        console.log("Creating complaint...");
        const formData = new FormData();
        formData.append('title', 'Test Complaint');
        formData.append('description', 'Test Description');
        formData.append('category', 'Sanitation');
        formData.append('lat', '20.2');
        formData.append('lng', '75.2');
        formData.append('address', 'Test Area');

        const compRes = await axios.post('https://citizen-grievance-backend.vercel.app/api/complaints', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("Complaint success:", compRes.data);

    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}
test();
