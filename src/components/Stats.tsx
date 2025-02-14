import React from "react";
import { MdDelete } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import browser from 'webextension-polyfill';


export interface Level {
    difficulty: string;
    solved: number;
    total: number;
}

export interface ProgressCardProps {
    total: number;
    solved: number;
    attempting: number;
    levels: Level[];
    username: string;
    submissionsToday: number;
}

const Stats: React.FC<ProgressCardProps> = ({
    total,
    solved,
    levels,
    username,
    submissionsToday,
}) => {
    const segmentSize = 100 / 3;
    const strokeWidth = 2;

    const fillPercentages = levels.map((level) =>
        level.total > 0 ? (level.solved / level.total) * segmentSize : 0
    );

    const colors = [
        { light: "#284545", dark: "#4fbbbb" },
        { light: "#534527", dark: "#f5b602" },
        { light: "#512a2c", dark: "#ed3837" },
    ];

    const deleteUser = (username: string) => {
        browser.storage.local.get('allUserNames').then((res) => {
            const allUsers: string[] = res.allUserNames as string[] || [];

            const updatedUsers = allUsers.filter((user) => user !== username);
            browser.storage.local.set({ allUserNames: updatedUsers }).then(() => {
                console.log(`Deleted ${username} successfully.`);
            }).catch((error) => {
                console.error("Error updating storage:", error);
            });
        }).catch((error) => {
            console.error("Error retrieving storage data:", error);
        });
    };

    return (
        <div className="bg-gray-900 gap-3 p-2 rounded-xl shadow-2xl w-full flex flex-col justify-center">
            <div className="flex justify-between items-center">
            <h1 className="text-white font-bold text-xl">{username}</h1>
            <button onClick={(e)=>{
                e.preventDefault();
                deleteUser(username);
            }}>
            <MdDelete className="text-red-700 text-xl" />
            </button>
            </div>
            <div className="text-white flex justify-between items-center">
                <div className="flex items-center justify-between">
                    <div className="relative">
                        <div className="relative w-32 h-3w-32">
                            <svg
                                className="w-full h-full"
                                viewBox="0 0 36 36"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {colors.map((color, index) => (
                                    <circle
                                        key={index}
                                        cx="18"
                                        cy="18"
                                        r="15.9155"
                                        fill="none"
                                        stroke={color.light}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={`${segmentSize} ${100 - segmentSize}`}
                                        strokeDashoffset={25 - segmentSize * index}
                                    />
                                ))}

                                {fillPercentages.map((fill, index) => (
                                    <circle
                                        key={index}
                                        cx="18"
                                        cy="18"
                                        r="15.9155"
                                        fill="none"
                                        stroke={colors[index].dark}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={`${fill} ${100 - fill}`}
                                        strokeDashoffset={25 - segmentSize * index}
                                        strokeLinecap="round"
                                    />
                                ))}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="font-semibold text-lg"><span className="text-2xl font-bold">{solved}</span>/{total}</span>
                                <span className="font-semibold flex gap-1"><TiTick className="text-green-800 text-xl" />Solved</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className=" space-y-2">
                    {levels.map((level, index) => (
                        <div key={index} className="flex flex-col justify-between bg-gray-800 px-2 rounded-lg">
                            <span
                                className={`text-sm ${index === 0
                                    ? "text-green-400"
                                    : index === 1
                                        ? "text-yellow-400"
                                        : "text-red-400"
                                    }`}
                            >
                                {level.difficulty}
                            </span>
                            <span className="text-sm text-white">
                                {level.solved}/{level.total}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-center">
                <div className=" bg-gray-800 px-4 py-2 rounded-lg text-white">
                    <span className="font-bold text-yellow-400 text-lg"><span className="font-semibold text-md text-white">Submissions Today: </span>{submissionsToday}</span>
                </div>
            </div>
        </div>
    );
};

export default Stats;
