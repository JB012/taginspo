import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router";
import axios from 'axios';
export default function EditTag() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [color, setColor] = useState("");

    function handleSubmit() {
        if (title !== "") {
            try {
                axios.post('http://localhost:3000/tags/add', {title: title, color: color}).then(res => {
                    if (res.status === 200) {
                        navigate('/tags');
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
                <FaArrowLeft className="cursor-pointer" onClick={() => navigate("/gallery")} data-testid="cancel-image" size={20} scale={1} />
                <button className="cursor-pointer" onClick={() => handleSubmit()}>Save Changes</button>
            </div>
            <div className="text-[40px]">New Tag</div>
            <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                        <label htmlFor="title">Title</label>
                    </div>
                    <input required value={title} onChange={(e) => setTitle(e.target.value)} id="title" className="w-[464px] h-[50px] rounded-full outline outline-black" />
                </div>
                <div className="flex flex-col gap-4">
                    <label htmlFor="color">Color</label>
                    <input value={color} onChange={(e) => setColor(e.target.value)} id="color" type="color" />
                </div>
            </div>

        </div>
    )
}