import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { FaList, FaPlusCircle } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import DashboardPreview from "../../components/DashboardPreview"
import axios from 'axios';
import { useUser } from '@clerk/clerk-react'
import useToken from '../../utils/useToken'

export default function Gallery() {
    const [input, setInput] = useState("");
    const [preSignedURLs, setPreSignedURLs] = useState([]);
    const token = useToken();

    useEffect(() => {
        if (preSignedURLs.length === 0) {
            try {
                axios
                .get('http://localhost:3000/images', {headers: { Authorization: `Bearer ${token}` }})
                .then((res) => {
                    if (res.status === 200) {
                        setPreSignedURLs(res.data);
                    }
                });
            }
            catch (err) {
                console.log(err);
            }
        }
    }, [preSignedURLs, token]);

    return (
        <>
        <SignedIn>
            <div className="flex flex-col w-full h-full px-16">
                 <header className="flex w-full gap-10 justify-between items-center">    
                    <div className="text-[36px] font-bold">TagInspo</div>
                    <div className="flex items-center relative">
                        <input className="flex outline outline-black rounded-full w-[550px] px-12 h-[39px]" value={input} onChange={(e) => setInput(e.target.value)} />
                        <FaMagnifyingGlass className="absolute left-5" scale={1}/>
                    </div>
                    <UserButton></UserButton>
                 </header>
                 <div className="flex flex-col w-full">
                    <div className="flex w-full justify-between py-10 items-center">
                        <div className="flex items-center gap-8">
                            <div className="text-[32px] font-bold">Your images</div>
                            <FaPlusCircle scale={1} size={20}/>
                        </div>
                        <FaList size={20} scale={1}/>
                    </div>
                    <div id="images-previews" className="flex w-full justify-center flex-wrap gap-25">
                        {
                            preSignedURLs.map((url) => <img src={url} key={url} width={200} height={200} />)
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