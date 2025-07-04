const Sponsors = () => {
  return (
    <div className='w-full flex justify-center bg-secondarygray px-4 sm:px-6 md:px-12 mt-4 sm:mt-7 pb-10 sm:pb-16 md:pb-28 relative overflow-hidden'>
        <div className='w-full max-w-[1400px] flex flex-col justify-center items-center'>
            {/* Gradient overlays */}
            <div className='h-full w-[40px] sm:w-[60px] md:w-[120px] bg-gradient-to-r from-secondarygray via-[rgba(249, 250, 255, 0.5)] to-[rgba(249, 250, 255, 0.5)] absolute top-0 left-0 z-20' />
            <div className='h-full w-[40px] sm:w-[60px] md:w-[120px] bg-gradient-to-l from-secondarygray via-[rgba(249, 250, 255, 0.5)] to-[rgba(249, 250, 255, 0.5)] absolute top-0 right-0 z-20' />
            
            {/* First row of sponsors */}
            <div className='sponsors-container-1 w-full md:w-[85%] flex flex-wrap sm:flex-nowrap items-center justify-center gap-4 sm:gap-6 md:gap-16'>
                <img 
                    src='/images/10.png' 
                    className='w-24 sm:w-32 md:w-40 object-contain'
                    alt="Sponsor 1"
                />
                <img 
                    src='/images/8.png' 
                    className='w-24 sm:w-32 md:w-40 object-contain'
                    alt="Sponsor 2"
                />
                <img 
                    src='/images/5.png' 
                    className='w-24 sm:w-32 md:w-40 object-contain'
                    alt="Sponsor 3"
                />
                <img 
                    src='/images/7.png' 
                    className='w-24 sm:w-32 md:w-40 object-contain hidden sm:block'
                    alt="Sponsor 4"
                />
                <img 
                    src='/images/9.png' 
                    className='w-24 sm:w-32 md:w-40 object-contain hidden sm:block'
                    alt="Sponsor 5"
                />
            </div>

            {/* Second row of sponsors */}
            <div className='sponsors-container-2 w-full md:w-[85%] flex flex-wrap sm:flex-nowrap items-center justify-center gap-4 sm:gap-6 md:gap-16 mt-4 sm:mt-6 md:mt-8'>
                <img 
                    src='/images/2.png' 
                    className='w-24 sm:w-32 md:w-40 object-contain'
                    alt="Sponsor 6"
                />
                <img 
                    src='/images/4.png' 
                    className='w-24 sm:w-32 md:w-40 object-contain'
                    alt="Sponsor 7"
                />
                <img 
                    src='/images/6.png' 
                    className='w-24 sm:w-32 md:w-40 object-contain'
                    alt="Sponsor 8"
                />
                <img 
                    src='/images/3.png' 
                    className='w-24 sm:w-32 md:w-40 object-contain hidden sm:block'
                    alt="Sponsor 9"
                />
                <img 
                    src='/images/1.png' 
                    className='w-24 sm:w-32 md:w-40 object-contain hidden sm:block'
                    alt="Sponsor 10"
                />
            </div>
        </div>
    </div>
  )
}

export default Sponsors