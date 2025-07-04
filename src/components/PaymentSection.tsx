import Button from './Button';

const PaymentSection = () => {
  return (
    <section className='w-full min-h-screen w-full flex justify-center bg-white px-6 mlg:px-0 py-16 md:py-0'>
        <div className='w-full max-w-[1400px]'>
            <div className='w-full h-fit md:h-[560px] grid grid-cols-0 md:grid-cols-2'>
                <div className='md:col-span-1 relative lg:pl-12 flex items-center'>
                    <div className=''>
                        <h1 className='text-3xl md:text-[46px] leading-[30px] md:leading-[51px] font-semibold font-poppins max-w-[300px] md:max-w-[563px]'>
                        Quickly connect with the right team <span className='relative'>members <div className='absolute right-0 -bottom-2 md:-bottom-5 w-[50px] h-[5px] md:w-[100px] md:h-[10px] bg-primarygreen' /></span>
                        </h1>
                        <p className='text-xs md:text-[18px] md:leading-[2] text-black/80 font-poppins max-w-xs md:max-w-[563px] mt-6 md:mt-12'>Effortlessly connect with teammates and collaborate on hackathons, projects, and educational endeavors using our all-in-one platform designed to streamline team-building, communication, and project management.</p>
                        <Button text='Connect' containerClass='mt-6 md:mt-8' />
                    </div>
                    <img src='/images/grid.png' className='w-full absolute top-0 left-0' />
                </div>
                <div className='md:col-span-1 flex items-center justify-end bg-white mt-20 md:mt-0'>
                <img src='/images/poh1.png' className='w-[350px] md:w-[400px] lg:w-[450px] max-w-full' />



                </div>
            </div>
            <div className='w-full h-fit md:h-[560px] md:grid grid-cols-0 md:grid-cols-2 flex flex-col flex-col-reverse mt-16 md:mt-0'>
                <div className='col-span-1 flex items-center justify-start bg-white mt-24 md:mt-0'>
                    <img src='/images/work.png' className='w-[300px] lg:w-fit' />
                </div>
                <div className='col-span-1 relative pl-6 md:pl-12 flex items-center'>
                    <div className=''>
                        <h1 className='text-3xl md:text-[46px] leading-[30px] md:leading-[51px] font-semibold font-poppins max-w-[300px] md:max-w-[563px]'>
                        Manage your processes, Applications & <span className='relative'>More<div className='absolute right-0 -bottom-2 md:-bottom-5 w-[50px] h-[5px] md:w-[100px] md:h-[10px] bg-primarygreen' /></span>
                        </h1>
                        <p className='text-xs md:text-[18px] md:leading-[2] text-black/80 font-poppins max-w-xs md:max-w-[563px] mt-6 md:mt-12'>We help you achieve your goals faster by efficiently connecting you with the right team and providing seamless collaboration for credential evaluation.</p>
                        <Button text='Register Now!' containerClass='mt-6 md:mt-8' />
                    </div>
                    <img src='/images/grid.png' className='w-[90%] md:w-[80%] lg:w-[70%] h-auto absolute top-0 left-0' />


                </div>
            </div>
        </div>
    </section>
  )
}

export default PaymentSection