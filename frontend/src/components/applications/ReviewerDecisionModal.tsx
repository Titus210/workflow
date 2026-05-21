import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
interface ReviewerDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingNumber: string;
  onSubmit: (decision: string, comment: string) => void;
  initialDecision?: 'APPROVED' | 'REJECTED' | 'NEED_MORE_INFO';
  lockDecision?: boolean;
}
export function ReviewerDecisionModal({
  isOpen,
  onClose,
  trackingNumber,
  onSubmit,
  initialDecision = 'APPROVED',
  lockDecision = false
}: ReviewerDecisionModalProps) {
  const [decision, setDecision] = useState<string>(initialDecision);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (isOpen) {
      setDecision(initialDecision);
      setComment('');
      setError('');
    }
  }, [isOpen, initialDecision]);
  const requiresComment =
  decision === 'REJECTED' || decision === 'NEED_MORE_INFO';
  const handleSubmit = () => {
    if (requiresComment && !comment.trim()) {
      setError('Comment is required for this decision');
      return;
    }
    onSubmit(decision, comment);
  };
  const handleClose = () => {
    setError('');
    onClose();
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Review Decision"
      subtitle={trackingNumber}>
      
      <div className="space-y-4">
        <Select
          label="Decision"
          value={decision}
          disabled={lockDecision}
          onChange={(e) => {
            setDecision(e.target.value);
            setError('');
          }}
          options={[
          {
            value: 'APPROVED',
            label: 'Approve'
          },
          {
            value: 'REJECTED',
            label: 'Reject'
          },
          {
            value: 'NEED_MORE_INFO',
            label: 'Need More Information'
          }]
          } />
        

        <Textarea
          label="Comment"
          required={requiresComment}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setError('');
          }}
          error={error}
          placeholder="Provide details about your decision..."
          rows={4}
          maxLength={500}
          showCount />
        

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Decision</Button>
        </div>
      </div>
    </Modal>);

}