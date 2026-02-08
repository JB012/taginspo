import { SignInButton, SignUpButton } from "@clerk/clerk-react"

export default function HomeHeader() {
    return (
        <header className="flex w-full h-full justify-between items-center">
            <div className="xs:text-[44px] xxs:text-[24px] font-bold">TagInspo</div>
            <div className="flex w-full justify-end gap-10">
                <SignUpButton><button className="outline-1 outline-black rounded-lg p-2 cursor-pointer">Sign Up</button></SignUpButton>
                <SignInButton><button className="bg-green-400 rounded-lg p-2 cursor-pointer">Log In</button></SignInButton>
            </div>
        </header>
    )
}