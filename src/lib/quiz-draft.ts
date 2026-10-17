import { QUIZ_LIMITS, quizEditorCopy } from "@/lib/config/course-editor";

export type QuizDraftOption = {
    id?: string;
    label: string;
    isCorrect: boolean;
};

export type QuizDraftQuestion = {
    id?: string;
    prompt: string;
    options: QuizDraftOption[];
};

export type QuizDraftError = {
    index: number | null;
    message: string;
};

export function validateQuizDraft(
    questions: QuizDraftQuestion[],
): QuizDraftError | null {
    const errors = quizEditorCopy.errors;

    if (questions.length === 0)
        return { index: null, message: errors.noQuestions };
    if (questions.length > QUIZ_LIMITS.questions) {
        return { index: null, message: errors.tooMany };
    }

    for (const [index, question] of questions.entries()) {
        const n = index + 1;
        if (question.prompt.trim() === "") {
            return { index, message: errors.prompt(n) };
        }
        if (question.options.length < QUIZ_LIMITS.minOptions) {
            return { index, message: errors.options(n) };
        }
        if (question.options.some((option) => option.label.trim() === "")) {
            return { index, message: errors.blankOption(n) };
        }
        const labels = question.options.map((option) =>
            option.label.trim().toLowerCase(),
        );
        if (new Set(labels).size !== labels.length) {
            return { index, message: errors.duplicate(n) };
        }
        if (
            question.options.filter((option) => option.isCorrect).length !== 1
        ) {
            return { index, message: errors.correct(n) };
        }
    }

    return null;
}
