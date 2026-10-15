import { Card } from "@/components/ui/card";

function InstructorAboutCard({
    firstName,
    about,
    skills,
}: {
    firstName: string;
    about: string[];
    skills: string[];
}) {
    return (
        <Card className="gap-0 p-6.5 ring-border">
            <h2 className="text-lg">About {firstName}</h2>
            <div className="mt-4 flex flex-col gap-4 text-sm text-muted-foreground">
                {about.length > 0 ? (
                    about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                ) : (
                    <p>{firstName} Hasn&apos;t Added a Bio Yet.</p>
                )}
            </div>
            {skills.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2.5">
                    {skills.map((skill) => (
                        <span
                            key={skill}
                            className="rounded-full bg-hover px-4 py-2 text-sm font-medium"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            ) : null}
        </Card>
    );
}

export { InstructorAboutCard };
