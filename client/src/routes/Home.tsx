import { SignedOut, SignUp } from '@clerk/clerk-react'
import HomeHeader from '../../components/HomeHeader'
import HomeFooter from '../../components/HomeFooter'

export default function Home() {
  return (
    <SignedOut>
      <div className="flex flex-col w-full h-full px-16">
          <HomeHeader />
          <div className='flex flex-col pt-[172px]'>
            <div className='flex justify-between items-center'>
              <div className='flex flex-col gap-2'>
                <div className='w-[338px] h-[184px] text-[40px]'>
                  All-in-one moodboard and image gallery
                </div>
                <div className='w-[338px] h-[132px] text-[20px]'>
                  Design and customize your ideas to your liking
                </div>
              </div>
              <button className='w-[134px] h-[27px] outline outline-black rounded-full text-center'>
                Get Started
              </button>
            </div>
            <div id='features-display' className='flex flex-col gap-10'>
              <div className='flex justify-between items-center'>
                <div className='flex flex-col gap-2'>  
                  <div className='text-[36px]'>
                    Arrange freely
                  </div>
                  <div className='text-[24px]'>
                    Drag-and-drop editor to suit your vision
                  </div>
                </div>
                <div className='w-[502px] h-[330px] bg-gray-400'>
                  Placeholder
                </div>
              </div>
              <div className='flex justify-between items-center'>
                <div className='w-[502px] h-[330px] bg-gray-400'>
                  Placeholder
                </div>
                <div className='flex flex-col gap-2'>  
                  <div className='text-[36px]'>
                    Tag Images
                  </div>
                  <div className='text-[24px] w-[263px] h-[104px]'>
                    Customize tags to
                    your images for easier
                    accessibility in the image gallery.
                  </div>
                </div>
              </div>
              <div className='flex justify-between items-center'>
                <div className='flex flex-col gap-2'>  
                  <div className='text-[36px]'>
                    Collaborate with your team
                  </div>
                  <div className='text-[24px] w-[351px] h-[52px]'>
                    Share your moodboard to design with your team in real time. 
                  </div>
                </div>
                <div className='w-[502px] h-[330px] bg-gray-400'>
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
  )
}