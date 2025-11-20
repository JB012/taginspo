import { SignInButton, SignUpButton } from "@clerk/clerk-react"

export default function HomeHeader() {
    return (
        <header className="flex w-full h-full justify-between items-center">
            <div className="text-[48px] font-bold">TagInspo</div>
            <div className="flex gap-10">
                <SignUpButton forceRedirectUrl={"/dashboard"}><div>Sign Up</div></SignUpButton>
                <SignInButton forceRedirectUrl={"/dashboard"}><div>Log In</div></SignInButton>
            </div>

        </header>
    )
}