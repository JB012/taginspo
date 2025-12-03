import { SignedOut, SignedIn,  SignUp, SignUpButton } from '@clerk/clerk-react'
import HomeHeader from '../../components/HomeHeader'
import HomeFooter from '../../components/HomeFooter'
import { Navigate } from 'react-router'

export default function Home() {
  return (
    <>
    <SignedOut>
      <div className="flex flex-col w-full h-full px-16">
          <HomeHeader />
          <div className='flex flex-col pt-[172px]'>
            <div id='hook-section' className='flex justify-between items-center'>
              <div className='flex flex-col gap-2'>
                <div className='w-[338px] h-[184px] text-[40px]'>
                  All-in-one moodboard and image gallery
                </div>
                <div className='w-[338px] h-[132px] text-[20px]'>
                  Design and customize your ideas to your liking
                </div>
              </div>
              <SignUpButton forceRedirectUrl={'/gallery'}>
                <button className='w-[115px] h-[30px] bg-green-400 rounded-lg cursor-pointer text-center'>
                  Get Started
                </button>
              </SignUpButton>
            </div>
            <div id='features-display' className='flex flex-col gap-10'>
              <div id='feature-1' className='feature flex justify-between items-center'>
                <div className='flex flex-col gap-2'>  
                  <div className='text-[36px]'>
                    Arrange freely
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
            </div>
          </div>
        <HomeFooter />
      </div>  
    </SignedOut>
    <SignedIn>
      <Navigate to={'/gallery'}/>
    </SignedIn>
    </>
  )
}