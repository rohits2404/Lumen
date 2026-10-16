"use client";

import Link from "next/link";
import { CheckIcon, RotateCcwIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CourseQuiz } from "@/lib/config/course-player";
import { cn } from "@/lib/utils";

const PASS_PERCENT = 80;

function QuizResults({
    quiz,
    answers,
    courseHref,
    onRetake,
}: {
    quiz: CourseQuiz;
    answers: Record<number, number>;
    courseHref: string;
    onRetake: () => void;
}) {
    const total = quiz.questions.length;
    const correct = quiz.questions.filter(
        (question, index) => answers[index] === question.answerIndex,
    ).length;
    const percent = Math.round((correct / total) * 100);
    const passed = percent >= PASS_PERCENT;

    return (
        <div className="mx-auto w-full max-w-179.5">
            <Link
                href={courseHref}
                className="flex w-fit items-center gap-2.5 text-[15px] text-muted-foreground hover:text-foreground"
            >
                <RotateCcwIcon className="size-4.5 -scale-x-100" />
                Back To Course
            </Link>

            <Card className="mt-4 gap-0 p-7.5 ring-border">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h1 className="text-xl font-bold">{quiz.title}</h1>
                    <p className="text-[15px] text-muted-foreground">Results</p>
                </div>

                <Progress
                    value={100}
                    aria-label="Quiz complete"
                    className="mt-5 **:data-[slot=progress-indicator]:bg-bar-fill **:data-[slot=progress-track]:h-2 **:data-[slot=progress-track]:bg-track"
                />

                <div className="mt-7 flex flex-col items-center text-center">
                    <span
                        className={cn(
                            "flex size-20 items-center justify-center rounded-full text-2xl font-extrabold tabular-nums",
                            passed
                                ? "bg-success/12 text-success"
                                : "bg-warning/12 text-warning",
                        )}
                    >
                        {percent}%
                    </span>
                    <h2 className="mt-4 text-xl font-bold">
                        {passed ? "Nice Work!" : "Worth Another Pass"}
                    </h2>
                    <p className="mt-1.5 text-[15px] leading-6 text-muted-foreground">
                        You Answered {correct} Of {total}{" "}
                        {total === 1 ? "Question" : "Questions"} Correctly.
                    </p>
                </div>

                <ul className="mt-7 flex flex-col gap-3">
                    {quiz.questions.map((question, index) => {
                        const chosen = answers[index];
                        const isCorrect = chosen === question.answerIndex;

                        return (
                            <li
                                key={question.prompt}
                                className="flex items-start gap-3.5 rounded-xl border border-border px-3.5 py-3.5"
                            >
                                <span
                                    className={cn(
                                        "flex size-9 shrink-0 items-center justify-center rounded-full text-white",
                                        isCorrect
                                            ? "bg-success"
                                            : "bg-destructive",
                                    )}
                                >
                                    {isCorrect ? (
                                        <CheckIcon
                                            className="size-4.5"
                                            strokeWidth={2.5}
                                        />
                                    ) : (
                                        <XIcon
                                            className="size-4.5"
                                            strokeWidth={2.5}
                                        />
                                    )}
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span className="block text-[15px] leading-6 font-semibold">
                                        {question.prompt}
                                    </span>
                                    <span className="mt-0.5 block text-sm leading-5 text-muted-foreground">
                                        {chosen === undefined
                                            ? "Skipped"
                                            : `Your Answer: ${question.options[chosen]}`}
                                    </span>
                                    {!isCorrect ? (
                                        <span className="mt-0.5 block text-sm leading-5 text-success">
                                            Correct Answer:{" "}
                                            {
                                                question.options[
                                                    question.answerIndex
                                                ]
                                            }
                                        </span>
                                    ) : null}
                                </span>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-6 flex items-center justify-between gap-4">
                    <Button
                        variant="outline"
                        onClick={onRetake}
                        className="h-10 gap-2 bg-card px-6 font-semibold shadow-sm"
                    >
                        <RotateCcwIcon
                            data-icon="inline-start"
                            className="size-4"
                        />
                        Retake Quiz
                    </Button>

                    <Button
                        nativeButton={false}
                        render={<Link href={courseHref} />}
                        className="h-10 gap-2 px-6 font-semibold"
                    >
                        Back To Course
                    </Button>
                </div>
            </Card>
        </div>
    );
}

export { QuizResults };
