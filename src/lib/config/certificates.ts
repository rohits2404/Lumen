import { siteConfig } from "@/lib/config/site";

export const CERTIFICATES_PAGE_SIZE = 4;

export const CERTIFICATE_ISSUER = "Lumen Academy";

export const certificatesCopy = {
    title: "Certificates",
    description:
        "Your Verified Credentials. Share Them Or Download A PDF Anytime.",
    ofCompletion: "Certificate Of Completion",
    instructor: "Instructor",
    issued: "Issued",
    idLabel: "ID",
    share: "Share",
    shareCopied: "Verification Link Copied.",
    shareFailed: "Could Not Copy The Link.",
    pdf: "PDF",
    showing: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} Of ${total} ${
            total === 1 ? "Certificate" : "Certificates"
        }`,
    empty: {
        title: "No Certificates Yet",
        description:
            "Finish A Course And Its Certificate Appears Here, Ready To Share Or Print.",
    },
} as const;

export const certificateStats = {
    earned: "Certificates Earned",
    hours: "Hours Completed",
    streak: "Longest Streak",
} as const;

export const CERTIFICATE_DIRECTOR = "Toby Belhome";

export const VERIFY_HOST = "verify.lumen.co";

export const certificateDocumentCopy = {
    title: "Certificate Of Completion",
    presentedTo: "This Is Proudly Presented To",
    body: {
        before: "For Successfully Completing The Course ",
        middle: ", Demonstrating Dedication And Mastery Of The Material Under The Guidance Of ",
        after: ".",
    },
    instructor: "Instructor",
    director: "Director",
    grade: (grade: string) => `Grade ${grade}`,
    id: "ID",
    issued: "ISSUED",
} as const;

export const CERTIFICATE_GROUND = "#fbfaf7";

export const certificateDownload = {
    fileName: (serial: string) => `lumen-certificate-${serial}.png`,
    failed: "Could Not Build The Image. Try Again.",
} as const;

export const certificatePreviewCopy = {
    title: "Certificate Preview",
    linkedIn: "Add To LinkedIn",
    download: "Download PNG",
    close: "Close Preview",
} as const;

export function linkedInAddToProfileUrl(row: {
    courseTitle: string;
    serial: string;
    publicSlug: string;
    issuedYear: number;
    issuedMonth: number;
}): string {
    const params = new URLSearchParams({
        startTask: "CERTIFICATION_NAME",
        name: row.courseTitle,
        organizationName: CERTIFICATE_ISSUER,
        issueYear: String(row.issuedYear),
        issueMonth: String(row.issuedMonth),
        certUrl: `${siteConfig.url}/certificates/${row.publicSlug}`,
        certId: row.serial,
    });
    return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

export const verificationCopy = {
    heading: "Verified Credential",
    lead: "This Certificate Was Issued By Lumen And Has Not Been Altered.",
    awardedTo: "Awarded To",
    completed: "Completed",
    serial: "Certificate ID",
    grade: "Grade",
    score: "Score",
    print: "Download PNG",
    printHint: "Saves A 1920 × 1358 PNG — Print It Or Attach It Anywhere.",
    notFoundTitle: "No Such Certificate",
    notFoundDescription:
        "That Link Does Not Match A Credential We Issued. Check The Address And Try Again.",
    browse: "Browse Courses",
} as const;
