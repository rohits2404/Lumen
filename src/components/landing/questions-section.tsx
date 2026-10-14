import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";
import { questions } from "@/lib/config/faq";

function QuestionsSection({ className }: { className?: string }) {
    return (
        <section className={cn("w-full", className)}>
            <div className="mx-auto w-full max-w-300 px-6 py-12 md:py-20">
                <h2 className="text-center text-[28px] leading-[1.2]">
                    Common Questions
                </h2>

                <Card className="mx-auto mt-8 max-w-192.5 gap-0 p-0 ring-border">
                    <Accordion defaultValue={[questions[0].id]}>
                        {questions.map((entry) => (
                            <AccordionItem
                                key={entry.id}
                                value={entry.id}
                                className="px-6 not-last:border-b-border-subtle"
                            >
                                <AccordionTrigger className="cursor-pointer py-4 text-base font-semibold hover:no-underline **:data-[slot=accordion-trigger-icon]:mt-1">
                                    {entry.question}
                                </AccordionTrigger>
                                <AccordionContent className="max-w-140 pb-5 text-base leading-[1.53] text-muted-foreground">
                                    {entry.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </Card>
            </div>
        </section>
    );
}

export { QuestionsSection };
