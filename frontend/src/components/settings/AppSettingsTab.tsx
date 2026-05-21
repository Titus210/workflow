import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';
import { ApplicationType } from '../../types/application';
import { getAppSettings, updateAppSettings } from '../../api/settingsApi';
export function AppSettingsTab() {
  const [settings, setSettings] = useState({
    defaultApplicationType: ApplicationType.RECORDATION,
    autoAssignReviewer: true,
    commentRequired: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    loadSettings();
  }, []);
  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getAppSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAppSettings(settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
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
          Application Settings
        </h3>
        <div className="space-y-4">
          <Select
            label="Default Application Type"
            value={settings.defaultApplicationType}
            onChange={(e) =>
            setSettings({
              ...settings,
              defaultApplicationType: e.target.value as ApplicationType
            })
            }
            options={[
            {
              value: ApplicationType.RECORDATION,
              label: 'Recordation'
            },
            {
              value: ApplicationType.RENEWAL,
              label: 'Renewal'
            },
            {
              value: ApplicationType.CHANGE_OF_OWNERSHIP,
              label: 'Change of Ownership'
            },
            {
              value: ApplicationType.CHANGE_OF_NAME,
              label: 'Change of Name'
            },
            {
              value: ApplicationType.DISCONTINUATION,
              label: 'Discontinuation'
            }]
            } />
          

          <div className="flex items-center justify-between py-3 border-b border-border-color">
            <div>
              <p className="text-sm text-text-primary">Auto-assign Reviewer</p>
              <p className="text-xs text-text-secondary mt-1">
                Automatically assign reviewers to new applications
              </p>
            </div>
            <Toggle
              enabled={settings.autoAssignReviewer}
              onChange={(enabled) =>
              setSettings({
                ...settings,
                autoAssignReviewer: enabled
              })
              }
              label="Auto-assign reviewer" />
            
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-text-primary">Comment Required</p>
              <p className="text-xs text-text-secondary mt-1">
                Require comments for rejection and need more info decisions
              </p>
            </div>
            <Toggle
              enabled={settings.commentRequired}
              onChange={(enabled) =>
              setSettings({
                ...settings,
                commentRequired: enabled
              })
              }
              label="Comment required" />
            
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </Card>
    </div>);

}