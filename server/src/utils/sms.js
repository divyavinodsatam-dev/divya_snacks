const axios = require('axios');

const sendSms = async (toPhone, message) => {
    try {
        const apiKey = process.env.TEXTBEE_API_KEY;
        const deviceId = process.env.TEXTBEE_DEVICE_ID;

        if (!apiKey || !deviceId) {
            console.error("❌ TextBee credentials missing in .env");
            return false;
        }

        // TextBee API Endpoint
        const url = `https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`;

        // TextBee expects the phone number format to be strict (e.g., +919876543210)
        // Ensure toPhone has the country code if your logic in frontend doesn't add it
        // Example: if (!toPhone.startsWith('+')) toPhone = '+91' + toPhone;

        const response = await axios.post(url, {
            recipients: [toPhone], // TextBee takes an array
            message: message
        }, {
            headers: {
                'x-api-key': apiKey
            }
        });

        console.log(`✅ SMS Sent via Android! Status: ${response.status}`);
        return true;
    } catch (error) {
        // Detailed error logging to help you debug
        console.error("❌ TextBee Error:", error.response?.data || error.message);
        return false;
    }
};

module.exports = { sendSms };