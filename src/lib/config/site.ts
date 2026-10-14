export const siteConfig = {
    name: "Lumen",
    description:
        "A Place To Learn Anything, Teach Everything, And Grow Together.",
    tagline: "One Platform for Both Sides of the Classroom.",
    legalName: "Lumen Learning, Inc.",
    url: "https://lumen.dev",
} as const;

export type NavItem = {
    title: string;
    href: string;
};

export const marketingNav: NavItem[] = [
    { title: "Features", href: "/features" },
    { title: "Courses", href: "/courses" },
    { title: "Teach", href: "/teach" },
    { title: "Pricing", href: "/pricing" },
];

export type NavGroup = {
    title: string;
    items: NavItem[];
};

export const footerNav: NavGroup[] = [
    {
        title: "Learn",
        items: [
            { title: "Browse Courses", href: "/courses" },
            { title: "Categories", href: "/categories" },
            { title: "Certificates", href: "/certificates" },
            { title: "Lumen Business", href: "/business" },
        ],
    },
    {
        title: "Teach",
        items: [
            { title: "Become An Instructor", href: "/teach" },
            { title: "Instructor Help", href: "/teach/help" },
            { title: "Payouts", href: "/teach/payouts" },
            { title: "Course Standards", href: "/teach/standards" },
        ],
    },
    {
        title: "Company",
        items: [
            { title: "About", href: "/about" },
            { title: "Careers", href: "/careers" },
            { title: "Blog", href: "/blog" },
            { title: "Contact", href: "/contact" },
        ],
    },
];

export const footerLegalNav: NavItem[] = [
    { title: "Privacy", href: "/privacy" },
    { title: "Terms", href: "/terms" },
    { title: "Status", href: "/status" },
];
