import { FaEllipsisV } from 'react-icons/fa'

export default function DashboardPreview() {
    return (
        <div className="flex flex-col justify-between p-6 w-[262px] h-[319] bg-gray-300 rounded-[36px]">
            <div className="w-[199px] h-[188px] bg-gray-600 rounded-[36px]">
                Image
            </div>
            <div className="text-2xl">
                Title
            </div>
            <div className="flex justify-between">
                <div>
                    Last opened: Time
                </div>
                <FaEllipsisV scale={1} size={20}/>
            </div>

        </div>
    )
}