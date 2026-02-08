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
            {/* <div id='features-display' className='flex flex-col gap-10'>
              <div id='feature-1' className='feature flex justify-between items-center'>
                <div className='flex flex-col gap-2'>  
                  <div className='text-[36px]'>
                    Upload images 
                  </div>
                  <div className='text-[24px]'>
                    Drag-and-drop editor to suit your vision
                  </div>
                </div>
                <div className='flex shrink w-[502px] h-[330px] bg-gray-400'>
                  Placeholder
                </div>
              </div>
              <div id='feature-2' className='feature flex justify-between items-center'>
                <div className='flex shrink w-[502px] h-[330px] bg-gray-400'>
                  Placeholder
                </div>
                <div className='flex flex-col gap-2'>  
                  <div className='text-[36px]'>
                    Tag Images
                  </div>
                  <div className='text-[24px] w-[350px] h-[104px]'>
                    Customize tags to
                    your images for easier
                    accessibility in the image gallery.
                  </div>
                </div>
              </div>
              <div id='feature-3' className='feature flex justify-between items-center'>
                <div className='flex flex-col gap-2'>  
                  <div className='text-[36px] w-[431.9px] h-[54px]'>
                    Collaborate with your team
                  </div>
                  <div className='text-[24px] w-[431.9px] h-[54px]'>
                    Share your moodboard to design with your team in real time. 
                  </div>
                </div>
                <div className='flex shrink w-[502px] h-[330px] bg-gray-400'>
                  Placeholder
                </div>
              </div>
            </div>
            <div className='flex flex-col justify-center items-center py-16 gap-10'>
              <div className='text-[32px]'>Explore your ideas today</div>
              <SignUp />
            </div> */}
          </div>
      </div>  
    </SignedOut>
    <SignedIn>
      <Navigate to={'/gallery?type=image'}/>
    </SignedIn>
    </>
  )
}