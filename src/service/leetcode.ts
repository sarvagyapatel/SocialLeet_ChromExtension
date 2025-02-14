import axios from 'axios';

// Format data for a single user
// const formatData = (data) => {
//   return {
//     recentSubmissions: JSON.parse(data.matchedUser.submissionCalendar),
//     levels: data.matchedUser.submitStats.acSubmissionNum.map((level) => ({
//       difficulty: level.difficulty,
//       solved: level.count,
//       total: data.allQuestionsCount.find((l) => l.difficulty === level.difficulty)?.count || 0,
//     })),
//   };
// };

// Function to handle a single user
export const leetcode = async (input:string) => {
  const username = input; // Get username from URL parameter

  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
      }
    }
  `;

  try {
    const response = await axios.post(
      `/api/graphql`,
      { query, variables: { username } },
      {
        headers: {
          'Content-Type': 'application/json',
          Referer: '/api',
        },
      }
    );

    const data = response.data;
    if (data.errors) {
      return data.errors;
    }
    return true;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return error;
  }
};


// export const leetcodeBatch = async (req, res) => {
//   const users = req.body.usernames;

//   if (!Array.isArray(users) || users.length === 0) {
//     return res.status(400).json({ error: 'Please provide an array of usernames.' });
//   }

//   const query = `
//     query getUserProfile($username: String!) {
//       matchedUser(username: $username) {
//         submitStats {
//           acSubmissionNum {
//             difficulty
//             count
//           }
//         }
//         submissionCalendar
//       }
//       allQuestionsCount {
//         difficulty
//         count
//       }
//     }
//   `;

//   try {
//     const requests = users.map((username) =>
//       axios.post(
//         'https://leetcode.com/graphql',
//         { query, variables: { username } },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Referer: 'https://leetcode.com',
//           },
//         }
//       )
//     );

//     const responses = await Promise.allSettled(requests);

//     const results = responses.map((response, index) => {
//       if (response.status === 'fulfilled') {
//         const data = response.value.data;
        
//         if (data.errors) {
//           return { username: users[index], error: data.errors };
//         }
//         return { username: users[index], data: formatData(data.data) };
//       } else {
//         return { username: users[index], error: response.reason.message };
//       }
//     });

//     res.json(results);
//   } catch (error) {
//     console.error('Batch Error:', error);
//     res.status(500).json({ error: 'Internal Server Error', details: error.message });
//   }
// };
