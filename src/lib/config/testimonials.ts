export type Testimonial = {
    id: string;
    name: string;
    role: string;
    avatar: string;
    audience: "Instructor" | "Learner";
    quote: string;
};

export const testimonials: Testimonial[] = [
    {
        id: "nadia-rahman",
        name: "Nadia Rahman",
        role: "Product Designer · London",
        avatar: "/testimonials/nadia-rahman.png",
        audience: "Learner",
        quote: "I Finally Finished A Course Instead Of Abandoning It At Lesson Four. The Timestamped Notes Meant Revision Took Minutes, Not Another Full Rewatch.",
    },
    {
        id: "simon-simorangkir",
        name: "Simon Simorangkir",
        role: "Illustrator · 12,480 Students",
        avatar: "/testimonials/simon-simorangkir.png",
        audience: "Instructor",
        quote: "I Published My First Course In A Weekend And It Has Paid More Than A Year Of Freelance Retainers. The Builder Gets Out Of The Way, Which Is All I Ever Wanted.",
    },
    {
        id: "priya-nadar",
        name: "Priya Nadar",
        role: "Head Of L&D, Ridgeline",
        avatar: "/testimonials/priya-nadar.png",
        audience: "Learner",
        quote: "We Rolled Lumen Out To Forty People In A Week. The Completion Numbers Are The First Ones I Have Ever Been Happy To Put In A Board Deck.",
    },
    {
        id: "marco-devine",
        name: "Marco Devine",
        role: "Engineer · 48,300 Students",
        avatar: "/testimonials/marco-devine.png",
        audience: "Instructor",
        quote: "Payments, Hosting And Support Stopped Being My Problem Overnight. I Write The Lessons, Answer The Questions, And The Rest Of It Just Runs.",
    },
];
