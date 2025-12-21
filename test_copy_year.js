const axios = require('axios');

async function testCopyYear() {
  try {
    const sourceYear = 2027;
    const targetYear = 2028;
    
    console.log(`Testing copy from ${sourceYear} to ${targetYear}...`);
    
    // Test the API endpoint directly
    const response = await axios.post('http://localhost:8094/api/AnnualWorkPlans/copy-year', {
      sourceYear,
      targetYear
    });
    
    console.log('Response:', response.data);
    console.log('✅ Test passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testCopyYear();
