import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { getProfile, updateProfile } from '../../api/settingsApi';
export function ProfileTab() {
  const [profile, setProfile] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    loadProfile();
  }, []);
  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile({
        name: data.name,
        email: data.email
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <div className="text-text-secondary">Loading...</div>;
  }
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Profile Information
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-accent rounded-sm flex items-center justify-center">
              <span className="text-white text-2xl font-medium">
                {profile.name.
                split(' ').
                map((n) => n[0]).
                join('').
                toUpperCase()}
              </span>
            </div>
            <Button variant="secondary">Change Avatar</Button>
          </div>

          <Input
            label="Name"
            value={profile.name}
            onChange={(e) =>
            setProfile({
              ...profile,
              name: e.target.value
            })
            } />
          

          <Input
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) =>
            setProfile({
              ...profile,
              email: e.target.value
            })
            } />
          

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>
    </div>);

}