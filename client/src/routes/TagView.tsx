import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { FaList, FaPlusCircle } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import axios from 'axios';
import useToken from '../../utils/useToken'
import { useNavigate } from "react-router";

export default function TagView() {
    const [input, setInput] = useState("");
    // Initial state is null instead of empty array to prevent multiple axios calls from useEffect
    const [tags, setTags] = useState<[]|null>(null);
    const navigate = useNavigate();
    const token = useToken();

    useEffect(() => {
        if (!tags && token !== "") {
            try {
                axios
                .get('http://localhost:3000/tags', {headers: { Authorization: `Bearer ${token}` }})
                .then((res) => {
                    if (typeof res.data === "object") {
                        setTags(res.data);
                    }
                });
            }
            catch (err) {
                console.log(err);
            }
        }
    }, [tags, token]);

    return (
        <>
        <SignedIn>
            <div className="flex flex-col w-full h-full px-16">
                 <header className="flex w-full justify-between items-center">    
                    <div className="text-[36px] font-bold">TagInspo</div>
                    <div className="flex items-center relative">
                        <input className="flex outline outline-black rounded-full w-[600px] px-12 h-[39px]" value={input} onChange={(e) => setInput(e.target.value)} />
                        <FaMagnifyingGlass className="absolute left-5" scale={1}/>
                    </div>
                    <UserButton></UserButton>
                 </header>
                 <div className="flex flex-col w-full">
                    <div className="flex w-full justify-between py-10 items-center">
                        <div className="flex items-center gap-8">
                            <div className="text-[32px] font-bold">Your tags</div>
                            <FaPlusCircle onClick={() => navigate("/edittags")} id="add-button" className="cursor-pointer" scale={1} size={20}/>
                        </div>
                        <FaList id="sort-button" className="cursor-pointer" size={20} scale={1}/>
                    </div>
                    <div id="images-previews" className="flex w-full justify-center flex-wrap gap-25">
                        {
                            tags ? tags.map((url) => <img src={url} key={url} width={200} height={200} />) : 'Click on the + button to add a tag'
                        }
                    </div>
                 </div>
            </div>
        </SignedIn>
        <SignedOut>
            Log in on the home page
        </SignedOut>
        </>
    )
}