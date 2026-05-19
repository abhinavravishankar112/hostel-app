const axios = require('axios');

async function test() {
  try {
    const api = 'http://localhost:5001/api';
    // Login as Arjun
    console.log('Logging in as Arjun...');
    const loginRes = await axios.post(`${api}/auth/login`, { email: 'arjun@uni.com', password: 'password123' });
    const arjunToken = loginRes.data.token;
    const arjunUser = loginRes.data.user;

    // Login as Rohan
    console.log('Logging in as Rohan...');
    const loginRes2 = await axios.post(`${api}/auth/login`, { email: 'rohan@uni.com', password: 'password123' });
    const rohanToken = loginRes2.data.token;
    const rohanUser = loginRes2.data.user;

    // Arjun requests Rohan
    console.log('Arjun requesting Rohan...');
    try {
      await axios.post(`${api}/matches/request/${rohanUser.id}`, {}, { headers: { Authorization: `Bearer ${arjunToken}` } });
      console.log('Request sent successfully');
    } catch (e) {
      console.log('Error sending request:', e.response?.data || e.message);
    }

    // Rohan accepts Arjun
    console.log('Rohan accepting Arjun...');
    const requestsRes = await axios.get(`${api}/matches/requests`, { headers: { Authorization: `Bearer ${rohanToken}` } });
    const reqToAccept = requestsRes.data.find(r => r.from._id === arjunUser.id);
    if (reqToAccept) {
      try {
        await axios.put(`${api}/matches/accept/${reqToAccept._id}`, {}, { headers: { Authorization: `Bearer ${rohanToken}` } });
        console.log('Request accepted successfully');
      } catch (e) {
        console.log('Error accepting request:', e.response?.data || e.message);
      }
    } else {
      console.log('No request found to accept');
    }
  } catch (e) {
    console.error('Fatal error:', e.message);
  }
}
test();
