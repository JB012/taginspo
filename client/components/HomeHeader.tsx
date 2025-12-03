import { SignInButton, SignUpButton } from "@clerk/clerk-react"

export default function HomeHeader() {
    return (
        <header className="flex w-full h-full justify-between items-center">
            <div className="text-[48px] font-bold">TagInspo</div>
            <div className="flex gap-10">
                <SignUpButton forceRedirectUrl={"/gallery"}><button className="outline-1 outline-black rounded-lg p-2 cursor-pointer">Sign Up</button></SignUpButton>
                <SignInButton forceRedirectUrl={"/gallery"}><button className="bg-green-400 rounded-lg p-2 cursor-pointer">Log In</button></SignInButton>
            </div>
        </header>
    )
}