export function formatCount(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
}

export function formatQuiz(quiz: { passed: number; total: number } | null) {
    return quiz === null ? "—" : `${quiz.passed}/${quiz.total}`;
}
