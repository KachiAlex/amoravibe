// Example: Netlify Function for user profile
exports.handler = async function(event, context) {
  // Simulate fetching user profile data (replace with real DB/API logic)
  const userProfile = {
    id: "user_123",
    name: "Jane Doe",
    email: "jane@example.com",
    gender: "female",
    orientation: "straight",
    discoverySpace: "global",
    matchPreference: "long-term",
    verificationIntent: "email"
  };

  return {
    statusCode: 200,
    body: JSON.stringify(userProfile)
  };
};
