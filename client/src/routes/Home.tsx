import { SignedOut, SignedIn, SignUpButton } from '@clerk/clerk-react'
import HomeHeader from '../../components/HomeHeader'
import { Navigate } from 'react-router'

export default function Home() {
  return (
    <>
    <SignedOut>
      <div className="flex flex-col w-full h-full sm:px-16 xxs:px-4">
          <HomeHeader />
          <div className='flex flex-col xs:pt-[172px] xxs:py-10'>
            <div id='hook-section' className='flex justify-between items-center'>
              <div className='flex flex-col'>
                <div className='xs:w-[338px] xs:h-[184px] xs:text-[48px] xxs:text-[24px] font-semibold'>
                  Tag your inspiration
                </div>
                <div className='xs:w-[338px] xs:h-[132px] xs:text-[20px] xxs:text-[10px]'>
                  Create a gallery where you can attach tags to images for an easier search.  
                </div>
              </div>
              <SignUpButton>
                <button className='xxs:w-[115px] xs:h-[30px] xs:text-[16px] xxs:text-sm bg-green-400 rounded-lg cursor-pointer text-center'>
                  Get Started
                </button>
              </SignUpButton>
            </div>
          </div>
      </div>  
    </SignedOut>
    <SignedIn>
      <Navigate to={'/gallery?type=image'}/>
    </SignedIn>
    </>
  )
}