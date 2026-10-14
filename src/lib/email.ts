import emailjs from "@emailjs/nodejs";
import { siteConfig } from "@/lib/config/site";

const serviceId = process.env.EMAILJS_SERVICE_ID;
const templateId = process.env.EMAILJS_TEMPLATE_ID;
const publicKey = process.env.EMAILJS_PUBLIC_KEY;
const privateKey = process.env.EMAILJS_PRIVATE_KEY;

const isConfigured = Boolean(serviceId && templateId && publicKey);

type Mail = {
    to: string;
    subject: string;
    text: string;
    actionUrl?: string;
    buttonText?: string;
};

async function sendMail({
    to,
    subject,
    text,
    actionUrl = "",
    buttonText = "Continue",
}: Mail) {
    if (!isConfigured) {
        if (process.env.NODE_ENV === "production") {
            throw new Error(
                "EmailJS Is Not Configured — Refusing To Drop A Transactional Email In Production.",
            );
        }

        console.info(
            `\n[email:dev] to=${to}\n` +
                `[email:dev] subject=${subject}\n` +
                `[email:dev] action=${actionUrl}\n` +
                `${text}\n`,
        );

        return;
    }

    try {
        await emailjs.send(
            serviceId!,
            templateId!,
            {
                to_email: to,
                subject,
                message: text,
                app_name: siteConfig.name,
                action_url: actionUrl,
                button_text: buttonText,
            },
            {
                publicKey: publicKey!,
                ...(privateKey ? { privateKey } : {}),
            },
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        throw new Error(`EmailJS Refused The Message: ${message}`);
    }
}

function sendVerificationEmail(to: string, url: string) {
    return sendMail({
        to,
        subject: `Verify Your ${siteConfig.name} Email`,
        text:
            `Welcome To ${siteConfig.name}!\n\n` +
            "Please Verify Your Email Address To Finish Setting Up Your Account.\n\n" +
            "If You Didn't Sign Up, You Can Safely Ignore This Email.",
        actionUrl: url,
        buttonText: "Verify Email",
    });
}

function sendInvitationEmail(to: string, url: string) {
    return sendMail({
        to,
        subject: `You Have Been Added To ${siteConfig.name}`,
        text:
            `An Account Has Been Created For You On ${siteConfig.name}.\n\n` +
            "Choose a Password To Finish Setting Up Your Account.\n\n" +
            "If You Weren't Expecting This Invitation, You Can Safely Ignore This Email.",
        actionUrl: url,
        buttonText: "Set Your Password",
    });
}

function sendChangeEmailConfirmation(
    to: string,
    newEmail: string,
    url: string,
) {
    return sendMail({
        to,
        subject: `Confirm Your New ${siteConfig.name} Email Address`,
        text:
            `A Request Was Made To Change The Email On Your ${siteConfig.name} Account To ${newEmail}.\n\n` +
            "Confirm The Change Only If You Requested It.\n\n" +
            "If You Didn't Ask For This, Ignore This Email. Your Address Stays As It Is. You May Also Want To Change Your Password.",
        actionUrl: url,
        buttonText: "Confirm Email Change",
    });
}

function sendPasswordResetEmail(to: string, url: string) {
    return sendMail({
        to,
        subject: `Reset Your ${siteConfig.name} Password`,
        text:
            "Use The Button Below To Choose A New Password.\n\n" +
            "This Link Expires In An Hour. If You Didn't Request A Reset, Ignore This Email — Nothing Has Changed.",
        actionUrl: url,
        buttonText: "Reset Password",
    });
}

export {
    sendChangeEmailConfirmation,
    sendInvitationEmail,
    sendMail,
    sendPasswordResetEmail,
    sendVerificationEmail,
};
