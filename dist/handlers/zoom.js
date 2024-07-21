require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const apiKey = process.env.ZOOM_API_KEY || "2BoDdG8gSCSw4Cpjex_bg";
const apiSecret = process.env.ZOOM_API_SECRET || "Tzzvrx1phf9l7uChxGQaorNVH2XsV61y";

function generateToken() {
    const payload = {
        iss: apiKey,
        exp: Math.floor(Date.now() / 1000) + 3600 // Expire après 1 heure
    };

    return jwt.sign(payload, apiSecret);
}

let token = generateToken();

async function getMeetings() {
    try {
        const response = await axios.get('https://api.zoom.us/v2/users/me/meetings', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching meetings:', error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 401) {
            token = generateToken(); // Régénérer le token si non autorisé
            return getMeetings(); // Réessayer avec le nouveau token
        }
    }
}

async function createMeeting(topic, start_time, type, duration, timezone, agenda) {
    try {
        const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
            topic,
            type,
            start_time,
            duration,
            timezone,
            agenda,
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: false,
                mute_upon_entry: true,
                watermark: false,
                use_pmi: false,
                approval_type: 0,
                audio: 'both',
                auto_recording: 'none'
            }
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating meeting:', error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 401) {
            token = generateToken(); // Régénérer le token si non autorisé
            return createMeeting(topic, start_time, type, duration, timezone, agenda); // Réessayer avec le nouveau token
        }
    }
}

(async () => {
    console.log(await getMeetings());

    const start_time = new Date().toISOString();

    console.log(await createMeeting('Companion new meeting', start_time, 2, 45, 'UTC', 'Assemblee Generale'));

    console.log(await getMeetings());
})();