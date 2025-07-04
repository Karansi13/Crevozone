import { useState } from "react";

const Faq = () => {
  const [accordionNumber, setAccordionNumber] = useState<number | null>(null);

  const handleAccordionButtonClick = (number: number) => {
    setAccordionNumber(accordionNumber === number ? null : number);
  };

  return (
    <section className="w-full min-h-screen md:min-h-fit lg:min-h-screen flex justify-center bg-white px-6 lg:px-24 py-24 relative">
      <div className="w-full max-w-[1400px] flex flex-col md:flex-row md:justify-between">
        <img
          src="/images/Ellipse.png"
          className="absolute bottom-0 left-0 z-0 md:z-10"
          alt="Background decoration"
        />

        <div className="max-w-[445px] relative">
          <h2 className="text-3xl md:text-[46px] leading-[30px] md:leading-[51px] font-semibold font-poppins">
            FAQ
          </h2>
          <p className="font-normal text-[18px] text-black/80 leading-[1.5] mt-3">
            Answers to your most pressing CrevoZone Questions. We've Got you!
          </p>
          <img
            src="/images/faq-arrow.svg"
            className="hidden md:block absolute w-[300px] lg:w-fit top-30 md:left-[0px] lg:right-[-100px] z-20"
            alt="FAQ Arrow"
          />
        </div>

        <div className="flex flex-col gap-5 w-full md:w-[600px] mt-5 md:mt-0 z-20">
          {faqData.map((faq, index) => (
            <div key={index} className="w-full rounded-lg bg-primarygray p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-black text-[19px] font-semibold font-poppins max-w-[250px] md:max-w-fit">
                  {faq.question}
                </h3>
                <button onClick={() => handleAccordionButtonClick(index + 1)}>
                  {accordionNumber === index + 1 ? (
                    <img src="/images/minus.svg" alt="Collapse" />
                  ) : (
                    <img src="/images/plus.svg" alt="Expand" />
                  )}
                </button>
              </div>

              <div
                className={`w-full transition-all duration-300 ease-in-out ${
                  accordionNumber === index + 1 ? "max-h-[200px]" : "max-h-0"
                } overflow-y-auto`}
                style={{
                  maxHeight: accordionNumber === index + 1 ? "150px" : "0px",
                }}
              >
                <p className="mt-4 text-[18px] leading-[1.3] font-normal text-black/80 p-2">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const faqData = [
  {
    question: "What is this platform designed for?",
    answer:
      "Our platform is designed to help you connect with teammates, collaborate on hackathons, projects, and educational ventures, and streamline the process of study abroad and relocation. It offers features like skill-based team matching, real-time collaboration tools, and project management for educational and immigration-related tasks.",
  },
  {
    question: "How does the skill-based matching feature work?",
    answer:
      "The skill-based matching feature allows users to create detailed profiles highlighting their skills. The platform then uses an intelligent algorithm to suggest teammates whose skills complement yours, ensuring an effective collaboration for your projects or hackathons.",
  },
  {
    question:
      "Can I use this platform for both academic and professional projects?",
    answer:
      "Yes! Our platform is designed to cater to both academic and professional collaboration needs. Whether you're working on a hackathon project, preparing for study abroad, or organizing a team for educational initiatives, the platform is versatile for all purposes.",
  },
  {
    question: "How does the AI-powered teammate matching work?",
    answer:
      "Our AI-powered system analyzes user profiles, skills, availability, and project needs to make personalized teammate recommendations. This feature helps ensure that your team is well-balanced and ready to take on the challenges ahead.",
  },
];

export default Faq;