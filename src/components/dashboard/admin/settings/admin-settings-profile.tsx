import { Card, CardContent } from "@/components/ui/card";
import { AvatarUpload } from "@/components/dashboard/settings/avatar-upload";
import { AdminProfileForm } from "@/components/dashboard/admin/settings/admin-profile-form";
import type { AdminProfile } from "@/lib/admin/settings";

function AdminSettingsProfile({ profile }: { profile: AdminProfile }) {
    return (
        <Card className="[--card-spacing:--spacing(7.5)]">
            <CardContent>
                <AvatarUpload image={profile.image} name={profile.name} />
                <div className="mt-7">
                    <AdminProfileForm profile={profile} />
                </div>
            </CardContent>
        </Card>
    );
}

export { AdminSettingsProfile };
