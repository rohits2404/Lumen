"use client";

import { ChevronRightIcon } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { type HelpFaq } from "@/lib/config/instructor-help";

function HelpFaqCard({ faqs }: { faqs: HelpFaq[] }) {
    return (
        <Accordion
            defaultValue={[faqs[0]?.question ?? ""]}
            multiple={false}
            className="overflow-hidden rounded-xl border bg-card"
        >
            {faqs.map((faq) => (
                <AccordionItem
                    key={faq.question}
                    value={faq.question}
                    className="not-last:border-b-border-subtle"
                >
                    <AccordionTrigger className="h-13.5 items-center rounded-none border-0 px-5.5 py-0 text-base font-semibold hover:no-underline **:data-[slot=accordion-trigger-icon]:hidden">
                        {faq.question}
                        <ChevronRightIcon className="ml-auto size-4.5 shrink-0 text-muted-foreground transition-transform group-aria-expanded/accordion-trigger:rotate-90" />
                    </AccordionTrigger>
                    <AccordionContent className="px-5.5 pt-0 pb-5">
                        <p className="max-w-160 text-[15px] leading-6 text-muted-foreground">
                            {faq.answer}
                        </p>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}

export { HelpFaqCard };
