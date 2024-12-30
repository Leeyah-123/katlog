import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileDetails } from '@/components/core/profile/profile-details';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | Katlog',
  description: 'Manage your Katlog profile settings',
};

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="bg-white/10 border-0 backdrop-blur-lg text-white">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileDetails />
        </CardContent>
      </Card>
    </div>
  );
}
