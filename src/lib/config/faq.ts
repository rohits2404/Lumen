export type Question = {
    id: string;
    question: string;
    answer: string;
};

export const questions: Question[] = [
    {
        id: "keep-forever",
        question: "Do I Keep A Course Forever If I Buy It?",
        answer: "Yes. Any Course You Purchase Outright Stays In Your Library Permanently, Including Future Updates The Instructor Makes. Courses Accessed Through Lumen Business Are Available While Your Plan Is Active.",
    },
    {
        id: "both-roles",
        question: "Can I Be Both A Learner And An Instructor?",
        answer: "One Account Covers Both. Switch Modes From The Sidebar And The Whole Workspace Follows — Your Courses, Notes, And Payouts Stay Where You Left Them.",
    },
    {
        id: "instructor-earnings",
        question: "How Much Do Instructors Earn?",
        answer: "You Keep Up To 70% Of Revenue On Every Sale, With No Listing Fees. Payouts Run On The 1st Of Each Month Once Your Balance Passes $100.",
    },
    {
        id: "refunds",
        question: "What Is The Refund Policy?",
        answer: "Every Course Purchase Is Covered By A 30-Day Refund Guarantee, No Questions Asked. Lumen Business Can Be Cancelled Any Time And Stays Active Until The End Of The Period You Paid For.",
    },
    {
        id: "equipment",
        question: "Do I Need Any Equipment To Teach?",
        answer: "A Laptop And A Decent Microphone Are Enough To Start. The Builder Handles Video Hosting, Transcoding, And Captions, So There Is Nothing To Install Or Configure.",
    },
];
