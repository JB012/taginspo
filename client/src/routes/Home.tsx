import { SignedOut, SignedIn, SignUpButton, SignUp } from '@clerk/clerk-react'
import HomeHeader from '../../components/HomeHeader'
import { Navigate } from 'react-router'

export default function Home() {
  return (
    <>
    <SignedOut>
      <div className="flex flex-col w-full h-full sm:px-16 xxs:px-4">
          <HomeHeader />
          <div className='flex flex-col'>
            <div id='hook-section' className='flex py-18 justify-between items-center'>
              <div className='flex flex-col lg:w-[350px] sm:w-[250px] xs:w-[200px] xxs:w-[100px]'>
                <div className='lg:text-[48px] sm:text-[36px] xs:text-[32px] py-2 xxs:text-[20px] font-semibold'>
                  Tag your inspiration
                </div>
                <div className='lg:text-[24px] sm:text-[18px] xs:text-[14px] xxs:text-[8px]'>
                  Create a gallery where you can attach tags to images for an easier search.  
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className='lg:w-[300px] lg:h-[300px] sm:w-[250px] sm:h-[250px] xs:w-[200px] xs:h-[200px] xxs:w-[150px] xxs:h-[150px]'>
                  <img className="w-full" src='main.png' />
                </div>
                <SignUpButton>
                  <button className='xxs:w-[100px] xs:h-[30px] xs:text-[16px] xxs:text-sm bg-green-400 rounded-lg cursor-pointer text-center'>
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            </div>
            <div id='features-display' className='flex flex-col gap-10'>
              <div id='feature-1' className='bg-neutral-200 p-2 rounded-3xl feature flex justify-between items-center'>
                <div className='flex flex-col xxs:w-[175px] sm:w-[245px] lg:w-[350px] xl:w-[400px] gap-2'>  
                  <div className='text-[36px] sm:text-[28px] xxs:text-[12px] xs:text-[18px]'>
                    Reduce manual image sorting
                  </div>
                  <div className='text-[30px] md:text-[24px] sm:text-[20px] xxs:text-[8px] xs:text-[14px]'>
                    Adding tags to images reduces the need of manually organizing images through folders.
                  </div>
                </div>
                <div className='flex shrink w-[502px] h-[330px] sm:w-[245px] xxs:w-[100px] xxs:h-[100px] xs:w-[200px] xs:h-[200px] xl:w-[400px] xl:h-[300px]'>
                  <img className='w-full' src='reduce_folder_use.png' alt="Accessing images through folder"/>
                </div>
              </div>
              <div id='feature-2' className='bg-neutral-200 p-2 rounded-3xl feature flex justify-between items-center'>
                <div className='flex shrink w-[502px] h-[330px] xxs:w-[100px] xxs:h-[100px] xs:w-[200px] xs:h-[200px] xl:w-[400px] xl:h-[300px]'>
                  <img className='w-full' title="Designed by vectorjuice / Freepik" src='find_references.png' alt='Looking through file references' />
                </div>
                <div className='flex flex-col gap-2 w-[400px] sm:w-[245px] xxs:w-[175px] lg:w-[350px] xl:w-[400px]'>  
                  <div className='text-[36px] sm:text-[28px] xxs:text-[12px] xs:text-[18px]'>
                    Find references faster
                  </div>
                  <div className='text-[30px] md:text-[24px] sm:text-[20px] xxs:text-[8px] xs:text-[14px]'>
                    Searching tags will show images that’ll shape your creative ideas.
                  </div>
                </div>
              </div>
              <div id='feature-3' className='bg-neutral-200 p-2 rounded-3xl feature flex justify-between items-center'>
                <div className='flex flex-col gap-2 sm:w-[245px] w-[400px] lg:w-[350px] xxs:w-[175px] xl:w-[400px]'>  
                  <div className='text-[36px] sm:text-[28px] xxs:text-[12px] xs:text-[18px]'>
                    Customize image organization
                  </div>
                  <div className='text-[30px] md:text-[24px] sm:text-[20px] xxs:text-[8px] xs:text-[14px]'>
                    Organize images through custom titles and tag creation
                  </div>
                </div>
                <div className='flex shrink w-[502px] h-[380px] xxs:w-[100px] xxs:h-[100px] xs:w-[200px] xs:h-[200px] xl:w-[400px] xl:h-[300px]'>
                  <img className='w-full' title="Designed by vectorjuice / Freepik" src='/custom_image.png' alt="Customize gallery with images" />
                </div>
              </div>
            </div>
            <div className='flex flex-col justify-center items-center py-16 gap-10'>
              <div className='md:text-[32px] xxs:text-[18px]'>Explore your ideas today</div>
              <SignUp />
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