import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router";
import axios from 'axios';
import { v4 } from 'uuid';
import { useAuth } from "@clerk/clerk-react";

export default function EditTag() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [color, setColor] = useState("#ffffff");
    const { getToken } = useAuth();

    function handleSubmit() {
        if (title) {
            try {
                getToken({skipCache: true}).then((token) => {
                    if (token) {
                        axios.post('http://localhost:3000/tags/add', {multipleTags : [{tagID: v4(), title: title, color: color}]}, 
                        {headers:  { Authorization: `Bearer ${token}` }}).then(res => {
                            if (!(res.data as string).includes("Title already exists")) {
                                navigate('http://localhost:5173/gallery');
                            }
                            else {
                                console.log(res.data);
                            }
                        });
                    }
                });
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    
    return (
        <div className="flex flex-col p-4 gap-10 w-full h-full">
            <div className="flex w-full justify-between">
                <FaArrowLeft onClick={() => navigate(-1)} data-testid="cancel-image" size={20} scale={1} />
                <button className="cursor-pointer" onClick={() => handleSubmit()}>Save Changes</button>
            </div>
            <div className="text-[40px]">New Tag</div>
            <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                        <label className="text-2xl" htmlFor="title">Title</label>
                    </div>
                    <input required value={title} onChange={(e) => setTitle(e.target.value)} id="title" className="w-[464px] h-[45px] p-4 rounded-full outline outline-black" />
                </div>
                <div className="flex flex-col gap-4">
                    <label htmlFor="color">Color</label>
                    <input value={color} onChange={(e) => setColor(e.target.value)} id="color" type="color" />
                </div>
            </div>

        </div>
    )
}