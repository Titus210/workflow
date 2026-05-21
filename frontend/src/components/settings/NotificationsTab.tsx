import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../ui/Card';
import { Toggle } from '../ui/Toggle';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import {
  getNotificationPrefs,
  updateNotificationPrefs } from
'../../api/settingsApi';
export function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    pushNotifications: false,
    digestFrequency: 'weekly'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    loadPrefs();
  }, []);
  const loadPrefs = async () => {
    setLoading(true);
    try {
      const data = await getNotificationPrefs();
      setPrefs(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateNotificationPrefs(prefs);
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
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
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border-color">
            <div>
              <p className="text-sm text-text-primary">Email Notifications</p>
              <p className="text-xs text-text-secondary mt-1">
                Receive email updates about your applications
              </p>
            </div>
            <Toggle
              enabled={prefs.emailNotifications}
              onChange={(enabled) =>
              setPrefs({
                ...prefs,
                emailNotifications: enabled
              })
              }
              label="Email notifications" />
            
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border-color">
            <div>
              <p className="text-sm text-text-primary">Push Notifications</p>
              <p className="text-xs text-text-secondary mt-1">
                Receive push notifications in your browser
              </p>
            </div>
            <Toggle
              enabled={prefs.pushNotifications}
              onChange={(enabled) =>
              setPrefs({
                ...prefs,
                pushNotifications: enabled
              })
              }
              label="Push notifications" />
            
          </div>

          <div className="py-3">
            <Select
              label="Digest Frequency"
              value={prefs.digestFrequency}
              onChange={(e) =>
              setPrefs({
                ...prefs,
                digestFrequency: e.target.value
              })
              }
              options={[
              {
                value: 'daily',
                label: 'Daily'
              },
              {
                value: 'weekly',
                label: 'Weekly'
              },
              {
                value: 'never',
                label: 'Never'
              }]
              } />
            
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </Card>
    </div>);

}