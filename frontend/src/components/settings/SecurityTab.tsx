import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { changePassword, getActiveSessions } from '../../api/settingsApi';
export function SecurityTab() {
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadSessions();
  }, []);
  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getActiveSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await changePassword(passwordData);
      toast.success('Password changed successfully');
      setPasswordData({
        current: '',
        new: '',
        confirm: ''
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password');
    }
  };
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Change Password
        </h3>
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordData.current}
            onChange={(e) =>
            setPasswordData({
              ...passwordData,
              current: e.target.value
            })
            } />
          
          <Input
            label="New Password"
            type="password"
            value={passwordData.new}
            onChange={(e) =>
            setPasswordData({
              ...passwordData,
              new: e.target.value
            })
            } />
          
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordData.confirm}
            onChange={(e) =>
            setPasswordData({
              ...passwordData,
              confirm: e.target.value
            })
            } />
          
          <div className="flex justify-end pt-2">
            <Button onClick={handlePasswordChange}>Change Password</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Two-Factor Authentication
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary">
              Enable two-factor authentication
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <Toggle
            enabled={twoFactorEnabled}
            onChange={setTwoFactorEnabled}
            label="Two-factor authentication" />
          
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Active Sessions
        </h3>
        <div className="space-y-3">
          {sessions.map((session) =>
          <div
            key={session.id}
            className="flex items-center justify-between p-3 border border-border-color rounded">
            
              <div>
                <p className="text-sm text-text-primary font-medium">
                  {session.device}
                </p>
                <p className="text-xs text-text-secondary">
                  {session.location} • {session.lastActive}
                </p>
                {session.current &&
              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-sm">
                    Current session
                  </span>
              }
              </div>
              {!session.current &&
            <Button
              variant="danger"
              onClick={() => toast.success('Session revoked')}>
              
                  Revoke
                </Button>
            }
            </div>
          )}
        </div>
      </Card>
    </div>);

}