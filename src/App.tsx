import browser from 'webextension-polyfill';
import { useEffect, useState } from 'react';
import Header from './components/Header'
import Stats, { ProgressCardProps } from './components/Stats'
import axios from 'axios';
import { RingLoader } from 'react-spinners';

interface DataPost {
  usernames: string[]
}

function App() {

  const [allUserData, setAllUserData] = useState<ProgressCardProps[] | null>(null);
  const [userNames, setUserNames] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    browser.storage.local.get('allUserNames').then((res) => setUserNames(res.allUserNames as string[]));
  }, [])

  useEffect(() => {
    setLoading(true);
    if (typeof browser === "undefined" && typeof chrome === "undefined") {
      console.warn("Not in a supported extension environment");
      return;
    }

    browser.storage.local.get('allUserNames').then(async (result) => {
      const allUserNames: string[] = result.allUserNames as string[] || [];

      if (allUserNames.length === 0) {
        console.log('No usernames found in storage');
        setUserNames(null)
        return;
      }

      function formatDateToYMD(timestamp: number): string {
        const date = new Date(timestamp);
        return date.toISOString().split('T')[0];
      }

      const getUserData = async (data:DataPost) => {
        try {
          const response = await axios.post("https://www.app2.vps.sarvagyapatel.in/batch", data);
          return response.data;
        } catch (error) {
          console.log(data)
          console.error("Error fetching data:", error);
          return null;
        }
      };

      const fetchUserData = async () => {
        const userData: ProgressCardProps[] = []
          const dataPost:DataPost = {
            usernames: allUserNames as string[]
          }

          const users =  await getUserData(dataPost)
          if (!users) return;
           
          for(const user of users){

          const timeStamp = Date.now();
          const keys = Object.keys(user.data.recentSubmissions);
          const values = Object.values(user.data.recentSubmissions);
          const firstTimestamp: number = parseInt(keys[keys.length - 1], 10);
          const firstSubmission: number = values[values.length - 1] as number;
          let solvedToday = 0;

          if (firstTimestamp && firstSubmission && formatDateToYMD(timeStamp) === formatDateToYMD((firstTimestamp) * 1000)) {
            solvedToday = firstSubmission;
          }

          const userdataTemp: ProgressCardProps = {
            total: user.data.levels[0].total,
            solved: user.data.levels[0].solved,
            attempting: 24,
            username: user.username,
            levels: [
              { difficulty: "Easy", solved: user.data.levels[1].solved, total: user.data.levels[1].total },
              { difficulty: "Med.", solved: user.data.levels[2].solved, total: user.data.levels[2].total },
              { difficulty: "Hard", solved: user.data.levels[3].solved, total: user.data.levels[3].total },
            ],
            submissionsToday: solvedToday,
          };

          userData.push(userdataTemp);
        }
        userData.sort((a, b) => b.submissionsToday - a.submissionsToday);
        setAllUserData(userData);
        setLoading(false);

        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "none";
      };

      await fetchUserData();
    }).catch((error) => {
      console.error("Error retrieving data from storage:", error);
    });

  }, [userNames]);



  useEffect(() => {
    if (typeof browser === "undefined" && typeof chrome === "undefined") {
      console.warn("Not in a supported extension environment");
      return;
    }
    const handleStorageChange = (changes: { [key: string]: unknown }, areaName: string) => {
      if (areaName === 'local' && changes.allUserNames) {
        setUserNames(changes.allUserNames as string[])
      }
    };
    browser.storage.onChanged.addListener(handleStorageChange);
  
    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);


  return (
    <div className='bg-slate-800 min-w-96 min-h-[600px] flex flex-col items-center gap-4'>
      <Header />
      {
        userNames ? (
          <>
            {
              allUserData && allUserData.length && !loading? (
                <div className='flex flex-col items-center gap-3 w-full text-center p-2 mt-[72px]'>
                  <div className='w-full text-center rounded-lg bg-gray-900 p-2 shadow-lg '>
                    <p className='text-xl font-bold text-yellow-500'>Your Leaderboard</p>
                  </div>
                  {allUserData.map((userdata) => (
                    <Stats
                      key={userdata.username}
                      total={userdata.total}
                      solved={userdata.solved}
                      attempting={userdata.attempting}
                      levels={userdata.levels}
                      username={userdata.username}
                      submissionsToday={userdata.submissionsToday}
                    />
                  ))}
                </div>
              ) : (
              <div className='flex flex-col items-center justify-center mt-64'>
                <RingLoader
                color="#0f172a"
                size={(window.innerHeight) / 5}
                loading
              />
              </div>
            )
            }
          </>
        ) : (
          <div className="text-center text-white p-2">
            <h1 className="text-2xl font-semibold mb-4">Enter your friend's LeetCode username</h1>
            <p className="text-sm mb-4"> To track your friend's LeetCode progress, simply add their username using the "Add Friend" button below. Once added, their progress will appear here, showing how many problems they've solved and their overall performance.</p>

            <Stats
              total={3246}
              solved={1234}
              attempting={24}
              levels={[
                { difficulty: "Easy", solved: 600, total: 850 },
                { difficulty: "Med.", solved: 400, total: 1781 },
                { difficulty: "Hard", solved: 234, total: 789 },
              ]}
              username="DemoUser"
              submissionsToday={5}
            />
          </div>
        )
      }
    </div>
  )
}

export default App;
