import browser from 'webextension-polyfill';
import {leetcode} from '../service/leetcode.ts'

function Header() {

    const addUser = async () => {
        const username = prompt("Enter Leetcode username");

        if (username===null) { 
            return;
        }

        if (!username.trim()) {
            alert("Please enter a valid username!");
            return;
        }


        browser.storage.local.get('allUserNames').then(async (result) => {
            const allUserNames: string[] = result.allUserNames as string[] || [];

            if (allUserNames.includes(username)) {
                alert("This username is already added.");
                return;
            }

            try{
                const res = await leetcode(username);
                if (res) {
                    alert("Incorrect LeetCode Username!")
                    return;
                }
                allUserNames.push(username);
                browser.storage.local.set({ allUserNames: allUserNames }).then(() => {
                    console.log("Updated allUserNames in storage");
                    alert("Username added successfully!");
                });
            }catch{
                alert("Incorrect LeetCode Username!")
                return;
            };
        })
    };

    return (
        <header className="w-full h-fit flex items-center justify-between bg-gray-900 p-4 rounded-lg shadow-md fixed z-10">
            <h1 className="text-2xl font-bold text-white">
                Social<span className="text-blue-400">Leet</span>
            </h1>

            <button
                className="p-2 px-4 bg-blue-600 text-white font-medium rounded-md shadow-lg hover:bg-blue-500 transition-all"
                onClick={(e) => {
                    e.preventDefault();
                    addUser();
                }}
            >
                + Add Friend
            </button>
        </header>
    );
}

export default Header;
