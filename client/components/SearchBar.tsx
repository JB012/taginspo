import { FaMagnifyingGlass } from "react-icons/fa6"

interface SearchBarProp {
    input : string
    handleInput: (userInput : string) => void
}
export default function SearchBar({input, handleInput} : SearchBarProp) {
    
    return (
        <div className="flex items-center relative">
            <input value={input} onChange={(e) => handleInput(e.target.value)} className="flex outline outline-black rounded-full w-[600px] px-12 h-[39px]" />
            <FaMagnifyingGlass className="absolute left-5" scale={1}/>
        </div>
    )
}