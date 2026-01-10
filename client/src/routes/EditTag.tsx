import { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router";
import axios from 'axios';
import { useAuth } from "@clerk/clerk-react";

export default function EditTag() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [color, setColor] = useState("#ffffff");
    const { getToken } = useAuth();
    const [editWarning, setEditWarning] = useState(localStorage.getItem('editWarning'));
    const editCheckRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        async function retrieveTagData() {
            try {
                const token = await getToken();

                const res = await axios.get(`http://localhost:3000/tags/${id}`, 
                    {headers: {Authorization: `Bearer ${token}`}}
                )

                if (res.status === 200 && typeof res.data !== "string") {    
                    setTitle(res.data.title);
                    setColor(res.data.color);                    
                }
                else {
                    console.error(`No tag with id: ${id} found`);
                }

            }
            catch (err) {
                console.log(err);
            }
        }

        if (!title) {
            retrieveTagData();   
        }

    }, [getToken, id, title]);

    async function handleSubmit() {
        if (title) {
            try {
                const token = await getToken();

                const res = await axios.post(`http://localhost:3000/tags/edit`, {tagID: id}, 
                    {headers: {Authorization: `Bearer ${token}`}});
                
                if (res.status === 200) {
                    if (editCheckRef.current && editCheckRef.current.checked) {
                        localStorage.setItem('editWarning', 'set');
                    }
                    
                    navigate(-1);
                }
            }
            catch (err) {
                console.log(err);
            }
        }
    }

    function handleSubmitClick() {
        // User pressed 'Do not show again' checkbox (editWarning="set")
        if (editWarning) {
            handleSubmit();
        }
        else {
            //editWarning needs to not be an empty string so the popup can show. The value
            //can be anything, as long as it isn't the string 'set'.
            setEditWarning('view')
        }
    }
    
    return (
        <div className={`w-full h-full relative ${editWarning && editWarning !== "set" ? "backdrop-brightness-50" : ""}`}>
            <div className={`flex flex-col p-4 gap-4 w-full h-full ${editWarning && editWarning !== "set" ? "pointer-events-none" : ""}`}>
            <div className="flex w-full justify-between">
                <FaArrowLeft onClick={() => navigate(-1)} data-testid="cancel-image" size={20} scale={1} />
                <button className="rounded-full p-4 cursor-pointer" style={{backgroundColor: title && (!editWarning || editWarning === "set") ? "cyan" : "gainsboro", 
                    color: title ? "black" : "white"}} onClick={() => handleSubmitClick()}>Save Changes</button>
            </div>
            <div className="text-[32px]">Edit Tag</div>
            <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                        <label className="text-2xl" htmlFor="title">Title</label>
                    </div>
                    <input required value={title} onChange={(e) => setTitle(e.target.value)} id="title" className="w-[464px] h-[45px] p-4 rounded-full outline outline-black" />
                </div>
                <div  className="flex flex-col gap-4">
                    <label className="text-2xl" htmlFor="color">Color</label>
                    <input value={color} onChange={(e) => setColor(e.target.value)} id="color" type="color" />
                </div>
            </div>
        </div>
        <div className={editWarning && editWarning !== "set" ? "absolute z-10 bg-white flex flex-col gap-8 w-[300px] h-[400px] top-1/3 left-150" : "hidden"}>
                <div>
                    Editing this tag will affect images that are attached to them.
                    Are you sure you want to make this change?
                </div>
                <div className="flex gap-2 self-center">
                    <input ref={editCheckRef} type="checkbox" />
                    <div>Do not show again</div>
                </div>
                <div className="flex justify-between">
                    <button onClick={() => handleSubmit()} className="rounded-full px-2 outline outline-black">Yes</button>
                    <button onClick={() => setEditWarning('')} className={"rounded-full px-2 outline outline-black"}>No</button>
                </div>
            </div>
        </div>
    )
}