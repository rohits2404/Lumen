import type { HelpArticle } from "@/lib/config/help-article";

export const instructorHelpArticles: HelpArticle[] = [
    {
        slug: "getting-started-as-an-instructor",
        categorySlug: "becoming-an-instructor",
        title: "Getting Started As An Instructor",
        lead: "Instructor Mode Is A Workspace Of Its Own — Its Own Navigation, Its Own Permissions, Its Own URL. This Guide Covers The First Hour: Finding The Workspace, Filling In The Profile Students Will Judge You By, And Getting A First Course As Far As The Review Queue.",
        readMinutes: 4,
        updatedAt: "2026-08-12",
        sections: [
            {
                title: "1. Switch Into Instructor Mode",
                paragraphs: [
                    "The Student / Instructor Control At The Top Of The Sidebar Is A Switch Between Two Workspaces, Not A Filter On One. Choosing Instructor Loads A Different Shell At Its Own Address, With Teaching Navigation, A Teaching Command Palette And The Permissions That Go With Them — Your Learning, Your Cart And Your Wishlist Stay In Student Mode, Where They Belong.",
                    "The Switch Only Offers Instructor Once You Have A Teaching Profile. If It Is Greyed Out, Your Application Has Not Been Approved Yet; Nothing You Do In The Meantime Is Lost.",
                ],
                callout: {
                    label: "Tip",
                    body: "The Collapse Control Beside The Search Field Shrinks The Sidebar To Icons, And That Preference Follows You Across Both Modes.",
                },
            },
            {
                title: "2. Fill In Your Public Profile",
                paragraphs: [
                    "Your Instructor Profile Is The Page A Student Reads Before Deciding To Buy. It Carries Your Name, Your Title, A One-Line Bio For The Course Page'S Instructor Card, A Longer About For The Profile Itself, And Your Skills. The One-Liner And The Long Version Are Separate Fields On Purpose — The Same Story Has To Work At Two Lengths.",
                    "Add A Photo. Every Course Card, Review Reply And Q&A Answer You Post Is Attributed To This Profile, And An Initials Avatar Beside A Paid Course Reads As Unfinished.",
                ],
            },
            {
                title: "3. Draft Your First Course",
                paragraphs: [
                    "Create Course Walks Through The Landing Page, The Curriculum, And Pricing. A Course Stays A Draft, Visible Only To You, Until You Submit It — So There Is No Cost To Starting It Before You Know How It Ends.",
                    "Aim For The Smallest Complete Thing. A Tight Four-Hour Course That A Student Finishes Beats A Twenty-Hour One They Abandon, And Completion Is What Earns The Reviews That Sell The Next One.",
                ],
            },
            {
                title: "4. Submit It For Review",
                paragraphs: [
                    "Submitting Moves The Course Into The Platform'S Review Queue. You Can Keep Editing While It Sits There — Your Changes Are Picked Up When It Is Approved — And You Will Get A Notification Either Way.",
                    "If It Comes Back With Changes Requested, The Reasons Are Attached To That Submission And Shown On The Course, So You Are Never Guessing What To Fix.",
                ],
            },
        ],
        related: [
            "what-happens-during-course-review",
            "building-your-curriculum",
            "content-standards-for-published-courses",
            "how-your-earnings-are-calculated",
        ],
    },
    {
        slug: "what-happens-during-course-review",
        categorySlug: "becoming-an-instructor",
        title: "What Happens During Course Review",
        lead: "Every Course Is Read By A Person Before It Goes On Sale. Review Usually Takes Up To Two Business Days, And There Are Only Three Ways It Can End.",
        readMinutes: 3,
        updatedAt: "2026-08-12",
        sections: [
            {
                title: "1. What A Reviewer Checks",
                paragraphs: [
                    "A Reviewer Works Through A Fixed Checklist: That The Landing Page Describes What The Course Actually Teaches, That The Curriculum Matches The Advertised Lesson Count And Runtime, That Audio Is Clear Enough To Learn From, And That The Course Closes With Something That Tests Understanding.",
                    "The Verdict On Each Item Is Recorded Against That Submission, Not Against The Course, So A Resubmission Is Judged On Its Own Terms Rather Than Inheriting An Old Opinion.",
                ],
            },
            {
                title: "2. The Three Outcomes",
                paragraphs: [
                    "Approved Publishes The Course And Starts Its Sales History. Changes Requested Sends It Back With The Failing Checklist Items And A Note — Fix Them And Resubmit. Rejected Is The One Decision You Cannot Resubmit Against; It Is Reserved For Courses The Platform Will Not Carry At All.",
                    "Whichever It Is, The Decision And Its Reasons Stay On The Course, So You Can Read Them Again Later.",
                ],
                callout: {
                    label: "Tip",
                    body: "Keep Editing While A Course Is In Review. Nothing Is Frozen, And Your Latest Draft Is What Goes Live On Approval.",
                },
            },
            {
                title: "3. If You Disagree",
                paragraphs: [
                    "Reply To The Decision Notification And A Moderator Will Look Again. Disputes Are About Whether The Checklist Was Applied Correctly — They Are Not A Second Opinion On Taste.",
                ],
            },
        ],
        related: [
            "getting-started-as-an-instructor",
            "content-standards-for-published-courses",
            "how-review-disputes-work",
            "building-your-curriculum",
        ],
    },
    {
        slug: "building-your-curriculum",
        categorySlug: "course-creation",
        title: "Building Your Curriculum",
        lead: "A Curriculum Is Sections Holding Lessons, And Students See The Whole Of It Before They Buy. Structure It So The Shape Of The Course Answers The Question They Are Actually Asking: What Will I Be Able To Do At The End?",
        readMinutes: 4,
        updatedAt: "2026-08-12",
        sections: [
            {
                title: "1. Start From The Outcomes",
                paragraphs: [
                    "Write The Four Or Five Things A Student Will Be Able To Do When They Finish, Then Group Them Into Sections. Sections That Came From Outcomes Tend To Be The Right Size On Their Own; Sections Invented First Tend To Sprawl.",
                    "Those Outcomes Are Also What The Sale Page Lists, So Writing Them Early Means You Are Not Inventing Marketing Copy After The Fact.",
                ],
            },
            {
                title: "2. Keep Lessons Short",
                paragraphs: [
                    "Six To Twelve Minutes Is The Range Students Finish. Anything Past Twenty Is Where Drop-Off Starts, And A Lesson Covering Two Ideas Is Nearly Always Two Lessons.",
                    "The Lesson List And Total Runtime Are Both Public Before Purchase, So An Honest Structure Is Doing Sales Work As Well As Teaching Work.",
                ],
                callout: {
                    label: "Tip",
                    body: "Reorder Sections And Lessons By Dragging Them. Progress Already Recorded Follows The Lesson, Not Its Position, So A Reshuffle Never Loses Anyone'S Place.",
                },
            },
            {
                title: "3. Close Each Section With A Check",
                paragraphs: [
                    "A Short Quiz At The End Of A Section Gives The Student A Reason To Consolidate And Gives You A Signal About Which Lesson Was Unclear. Review Expects A Course To Close With One.",
                ],
            },
        ],
        related: [
            "lesson-types-and-quizzes",
            "what-happens-during-course-review",
            "getting-started-as-an-instructor",
            "answering-student-questions",
        ],
    },
    {
        slug: "lesson-types-and-quizzes",
        categorySlug: "course-creation",
        title: "Lesson Types And Quizzes",
        lead: "Lessons Carry Video, Reading Or A Quiz. Mixing Them Deliberately Is Most Of What Separates A Course Students Finish From One They Leave Open In A Tab.",
        readMinutes: 3,
        updatedAt: "2026-08-12",
        sections: [
            {
                title: "1. Video, Reading And Quizzes",
                paragraphs: [
                    "Video Is For Demonstration — Anything A Student Needs To Watch You Do. Reading Is For Reference They Will Come Back To, Where Scrubbing A Video Is The Wrong Interaction. Quizzes Are For Checking Understanding Before The Course Moves On.",
                    "Analytics Reports Where Students Spend Their Time Across The Three, Which Is The Honest Way To Find Out Whether Your Reading Lessons Are Being Read.",
                ],
            },
            {
                title: "2. Writing Questions Worth Answering",
                paragraphs: [
                    "Ask About The Decision, Not The Vocabulary. A Question A Student Can Answer By Recognising A Word Tests Nothing; One That Makes Them Choose Between Two Reasonable Approaches Tells Both Of You Whether The Lesson Landed.",
                    "Keep Quizzes To Five Or Six Questions. A Student Who Fails Can Retake It, So The Point Is The Feedback Rather Than The Gate.",
                ],
            },
            {
                title: "3. Preview Lessons",
                paragraphs: [
                    "Marking A Lesson As A Free Preview Lets Prospective Students Watch It From The Sale Page. Pick One That Demonstrates How You Teach Rather Than The Introduction — The Introduction Sells The Topic, And They Are Already Interested In The Topic.",
                ],
            },
        ],
        related: [
            "building-your-curriculum",
            "answering-student-questions",
            "choosing-a-list-price",
            "what-happens-during-course-review",
        ],
    },
    {
        slug: "answering-student-questions",
        categorySlug: "teaching-and-students",
        title: "Answering Student Questions",
        lead: "Q&A Is The Highest-Leverage Thing In Your Workspace. Every Answer Is Read By The Students Who Come After The One Who Asked, So A Good Answer Is Written Once And Works For Years.",
        readMinutes: 3,
        updatedAt: "2026-08-12",
        sections: [
            {
                title: "1. Answer Where It Will Be Found",
                paragraphs: [
                    "Questions Are Attached To The Lesson They Were Asked From, So Answer Them There Rather Than By Message. The Next Student Stuck On The Same Lesson Sees The Thread Without Having To Ask Again.",
                    "Your Q&A Row Carries A Count Of What Is Waiting, And It Is The Number Worth Keeping Near Zero.",
                ],
            },
            {
                title: "2. Fix The Lesson, Not Just The Thread",
                paragraphs: [
                    "The Same Question Arriving Three Times Is A Lesson Problem, Not A Q&A Problem. Edit The Lesson, Then Answer The Thread With What Changed.",
                ],
                callout: {
                    label: "Tip",
                    body: "A Question You Answer With A Link To Another Of Your Lessons Is Doing Two Jobs — It Resolves The Thread And Shows The Student The Course Hangs Together.",
                },
            },
            {
                title: "3. Keep Discussions Separate",
                paragraphs: [
                    "Q&A Is For Getting Unstuck; Discussions Is For The Conversations Around The Subject. Moving A Sprawling Thread To Discussions Keeps The Lesson'S Q&A Readable For The Person Who Is Stuck Right Now.",
                ],
            },
        ],
        related: [
            "running-discussions-in-your-course",
            "lesson-types-and-quizzes",
            "how-review-disputes-work",
            "building-your-curriculum",
        ],
    },
    {
        slug: "running-discussions-in-your-course",
        categorySlug: "teaching-and-students",
        title: "Running Discussions In Your Course",
        lead: "Discussions Are Where A Course Stops Being A Video Library And Starts Being A Cohort. They Need Seeding And A Light Hand, And Not Much Else.",
        readMinutes: 3,
        updatedAt: "2026-08-12",
        sections: [
            {
                title: "1. Seed The First Threads Yourself",
                paragraphs: [
                    "An Empty Board Stays Empty. Post Two Or Three Real Prompts Tied To The Work — Something A Student Can Answer From What They Have Just Built Rather Than From Opinion.",
                ],
            },
            {
                title: "2. Reply Early, Then Step Back",
                paragraphs: [
                    "Instructor Replies In The First Weeks Set The Tone For Everything After, And Then The Useful Thing Is To Let Students Answer Each Other. Stepping In On Every Thread Teaches A Board To Wait For You.",
                ],
            },
            {
                title: "3. Moderation",
                paragraphs: [
                    "You Can Remove Posts That Break The Guidelines In Topics You Moderate. Disagreement Is Not A Guideline Breach — A Student Arguing That Your Approach Is Wrong Is The Board Working.",
                ],
            },
        ],
        related: [
            "answering-student-questions",
            "content-standards-for-published-courses",
            "how-review-disputes-work",
            "getting-started-as-an-instructor",
        ],
    },
    {
        slug: "how-your-earnings-are-calculated",
        categorySlug: "earnings-and-payouts",
        title: "How Your Earnings Are Calculated",
        lead: "Every Sale Writes An Earnings Record The Moment It Is Paid. Knowing What That Record Holds Explains Every Number On Your Revenue Page.",
        readMinutes: 4,
        updatedAt: "2026-08-12",
        sections: [
            {
                title: "1. Gross, Platform Share, Net",
                paragraphs: [
                    "A Sale Records What The Student Actually Paid, The Platform'S Share Of It, And Your Net. Discounts Come Off Before The Split, So A Coupon Reduces Both Sides Rather Than Only Yours.",
                    "Your Share Is Shown On The Revenue Page And Answered Exactly In The Help Centre'S Frequently Asked — It Is Read From The Platform'S Current Setting Rather Than Written Into This Guide, So It Cannot Go Stale Here.",
                ],
            },
            {
                title: "2. The Rate Is Fixed At The Moment Of Sale",
                paragraphs: [
                    "The Share That Applies Is The One In Force When The Purchase Happens, And It Is Stored On The Order. If The Platform Default Changes Later, Nothing You Have Already Earned Is Repriced — Which Also Means A Run Paid Two Years From Now Uses The Old Rate, Correctly.",
                ],
            },
            {
                title: "3. Clearing And Refunds",
                paragraphs: [
                    "Earnings Are Pending For About Thirty Days Before They Become Available To Pay Out. That Window Is What Lets A Refund Be Handled Cleanly: A Refunded Sale Reverses Its Earnings Record Instead Of Clawing Money Back Out Of A Payout That Already Went.",
                ],
                callout: {
                    label: "Tip",
                    body: "Gross Revenue On Your Analytics Page Is Deliberately Before Refunds. Compare It With Your Net For The Same Period To See The Real Refund Rate On A Course.",
                },
            },
        ],
        related: [
            "setting-up-payouts",
            "choosing-a-list-price",
            "running-coupons-and-promotions",
            "how-review-disputes-work",
        ],
    },
    {
        slug: "setting-up-payouts",
        categorySlug: "earnings-and-payouts",
        title: "Setting Up Payouts",
        lead: "Payouts Run On A Schedule You Control, To A Method You Nominate. Both Live In Payout Settings, And Getting Them Right Once Is The Whole Job.",
        readMinutes: 3,
        updatedAt: "2026-08-12",
        sections: [
            {
                title: "1. Add A Payout Method",
                paragraphs: [
                    "You Can Hold More Than One Method And Mark Which Is Primary; The Other Stands By As Backup. Getting A Second One On File Before You Need It Is What Turns A Failed Transfer Into A Non-Event.",
                ],
            },
            {
                title: "2. Your Schedule And Threshold",
                paragraphs: [
                    "Payout Settings Holds The Day Of The Month A Run Happens And The Minimum Balance It Needs To Reach. A Balance Under The Threshold Is Not Lost — It Rolls Into The Next Run. The Current Values For Your Account Are In The Help Centre'S Frequently Asked, Which Reads Them From Your Own Settings.",
                ],
            },
            {
                title: "3. When A Transfer Fails",
                paragraphs: [
                    "A Failed Transfer Usually Means Stale Bank Details. Fix The Method And The Balance Joins The Next Scheduled Run Automatically — There Is Nothing To Retry By Hand, And Nothing Is Written Off.",
                ],
            },
        ],
        related: [
            "how-your-earnings-are-calculated",
            "running-coupons-and-promotions",
            "choosing-a-list-price",
            "getting-started-as-an-instructor",
        ],
    },
    {
        slug: "choosing-a-list-price",
        categorySlug: "pricing-and-coupons",
        title: "Choosing A List Price",
        lead: "Price Is A Claim About What The Course Is Worth, And Students Read It That Way. Set It Against The Outcome You Deliver Rather Than The Hours You Spent Recording.",
        readMinutes: 3,
        updatedAt: "2026-08-12",
        sections: [
            {
                title: "1. Anchor On The Outcome",
                paragraphs: [
                    "Runtime Is A Poor Guide — A Course That Gets Someone Hired Is Not Worth Less Because It Is Short. Look At What Published Courses Promising A Comparable Outcome Charge, And Price Within That Range Unless You Can Say Precisely Why You Are Outside It.",
                ],
            },
            {
                title: "2. Changing It Later",
                paragraphs: [
                    "A New List Price Applies To Future Orders Only. Nobody Is Charged Again And Nobody Is Refunded The Difference, So There Is No Reason To Treat The First Price As Permanent.",
                ],
                callout: {
                    label: "Tip",
                    body: "Change Price And Watch Conversion, Not Revenue. Revenue Moves For Reasons That Have Nothing To Do With You; The Share Of Visitors Who Buy Is The Number Your Change Actually Touched.",
                },
            },
            {
                title: "3. Launching",
                paragraphs: [
                    "A New Course Has No Reviews, Which Is The Real Obstacle Rather Than The Price. A Lower Launch Price That Buys Your First Genuine Reviews Is Usually Worth More Than The Margin It Gives Up.",
                ],
            },
        ],
        related: [
            "running-coupons-and-promotions",
            "how-your-earnings-are-calculated",
            "setting-up-payouts",
            "building-your-curriculum",
        ],
    },
    {
        slug: "running-coupons-and-promotions",
        categorySlug: "pricing-and-coupons",
        title: "Running Coupons And Promotions",
        lead: "Coupons Are Yours; Platform Promotions Are Lumen'S. They Stack Differently And They Are Worth Using For Different Reasons.",
        readMinutes: 3,
        updatedAt: "2026-08-12",
        sections: [
            {
                title: "1. Coupons You Issue",
                paragraphs: [
                    "A Coupon Is A Code With A Discount, A Window And A Redemption Limit. Because They Are Codes, They Are The Right Tool For Something Targeted — A Cohort, A Newsletter, A Conference Talk — Where You Want To Know Which Audience Converted.",
                ],
            },
            {
                title: "2. Platform Promotions",
                paragraphs: [
                    "Lumen Runs Sales Across The Catalogue. Your Courses Join By Default And You Can Opt Out Per Course, Or For Everything You Teach, In Your Promotion Settings. A Promotion Discounts Your Current List Price For As Long As It Runs.",
                ],
            },
            {
                title: "3. Discounts And Your Earnings",
                paragraphs: [
                    "Discounts Come Off Before The Platform Split, So A Promotion Reduces The Platform'S Share In The Same Proportion As Yours. The Reach Is Usually Worth It On A Back-Catalogue Course And Rarely Worth It In A Launch Week, When You Want Full-Price Reviews.",
                ],
            },
        ],
        related: [
            "choosing-a-list-price",
            "how-your-earnings-are-calculated",
            "setting-up-payouts",
            "content-standards-for-published-courses",
        ],
    },
    {
        slug: "content-standards-for-published-courses",
        categorySlug: "policies-and-standards",
        title: "Content Standards For Published Courses",
        lead: "The Standards Are Short And They Are All About The Student Getting What They Were Promised. Most Rejections Are Accuracy Or Rights, Not Quality.",
        readMinutes: 3,
        updatedAt: "2026-08-12",
        sections: [
            {
                title: "1. Teach What You Advertised",
                paragraphs: [
                    "The Landing Page Is A Promise. If The Course Drifts As You Build It, Update The Outcomes And The Description Before You Submit — A Course That Delivers Something Different From Its Sale Page Is The Most Common Reason One Is Sent Back.",
                ],
            },
            {
                title: "2. Rights To Everything You Use",
                paragraphs: [
                    "Footage, Music, Images, Code And Slides All Need To Be Yours Or Licensed For Commercial Use, And Attribution Alone Is Not A Licence. Keep The Licences Where You Can Find Them; A Rights Dispute Is Resolved Much Faster When You Can Produce One.",
                ],
            },
            {
                title: "3. Keep It Current",
                paragraphs: [
                    "A Course Teaching A Tool That Has Moved On Is Inaccurate Even If It Was Right When Recorded. Re-Record The Lessons That Have Dated, Or Retire The Course — An Outdated Course Earns Refunds And One-Star Reviews In Roughly That Order.",
                ],
                callout: {
                    label: "Tip",
                    body: "Add A Dated Note To The First Lesson When A Tool Changes Under You. It Buys Goodwill While You Re-Record, And Students Tell You It Did In The Reviews.",
                },
            },
        ],
        related: [
            "how-review-disputes-work",
            "what-happens-during-course-review",
            "running-discussions-in-your-course",
            "building-your-curriculum",
        ],
    },
    {
        slug: "how-review-disputes-work",
        categorySlug: "policies-and-standards",
        title: "How Review Disputes Work",
        lead: "You Cannot Remove A Student Review, And That Is Deliberate. What You Can Do Is Report One That Breaks The Guidelines, And Reply To The Rest.",
        readMinutes: 3,
        updatedAt: "2026-08-12",
        sections: [
            {
                title: "1. Critical Is Not The Same As Abusive",
                paragraphs: [
                    "Reviews Are Never Removed For Being Critical — Only For Breaking The Guidelines. A Student Saying The Course Was Not Worth The Money Is Doing Exactly What The Rating Is For; A Review Containing Abuse, Spam Or Personal Information Is Not, And Should Be Reported.",
                ],
            },
            {
                title: "2. Reporting One",
                paragraphs: [
                    "Report The Review And Say Which Guideline It Breaks. A Moderator Decides, And The Outcome Is Either That It Stands, That It Is Removed, Or That It Is Hidden While The Reviewer Appeals.",
                ],
            },
            {
                title: "3. Replying Is Usually Better",
                paragraphs: [
                    "A Calm Reply Is Public And Permanent, And Every Future Reader Sees It Under The Complaint. Answering A Fair Criticism With What You Have Since Changed Does More For The Next Hundred Visitors Than Removing One Review Ever Would.",
                ],
            },
        ],
        related: [
            "content-standards-for-published-courses",
            "answering-student-questions",
            "what-happens-during-course-review",
            "running-discussions-in-your-course",
        ],
    },
];

export function instructorHelpArticle(slug: string): HelpArticle | undefined {
    return instructorHelpArticles.find((article) => article.slug === slug);
}

export function instructorArticleCount(categorySlug: string): number {
    return instructorHelpArticles.filter(
        (article) => article.categorySlug === categorySlug,
    ).length;
}
