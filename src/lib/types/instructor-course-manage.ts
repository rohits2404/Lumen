export type ActivityKind = "enrolment" | "review" | "question" | "earning";

export type ManageFacts = {
    sections: number;
    lessons: number;
    quizzes: number;
    students: number;
    unansweredQuestions: number;
    unrepliedReviews: number;
    activeCoupons: number;
};
