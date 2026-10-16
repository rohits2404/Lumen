import { Card, CardContent } from "@/components/ui/card";
import { AvatarUpload } from "@/components/dashboard/settings/avatar-upload";
import { ProfileForm } from "@/components/dashboard/settings/profile-form";
import type { Profile } from "@/lib/profile";

function SettingsProfile({ profile }: { profile: Profile }) {
    return (
        <Card className="[--card-spacing:--spacing(7.5)]">
            <CardContent>
                <AvatarUpload image={profile.image} name={profile.name} />
                <div className="mt-7">
                    <ProfileForm profile={profile} />
                </div>
            </CardContent>
        </Card>
    );
}

export { SettingsProfile };
