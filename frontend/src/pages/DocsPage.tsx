import React, { Component } from 'react';
import {
  FilePlus,
  Pencil,
  Send,
  PlayCircle,
  CheckCircle,
  RefreshCw,
  Grid3x3,
  Eye,
  Trash2 } from
'lucide-react';
import { Card } from '../components/ui/Card';
interface GuideStep {
  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;
  title: string;
  description: string;
  tip?: string;
}
const steps: GuideStep[] = [
{
  icon: FilePlus,
  title: 'Creating a new application',
  description:
  'Click the "New Application" button from the Dashboard or Applications list. Fill out the applicant name, email, company, application type, and a clear description. Saving creates the application in Draft status.',
  tip: 'Drafts are private to you and can be edited freely until you submit them.'
},
{
  icon: Pencil,
  title: 'Editing a draft',
  description:
  'Open any application in Draft status and click "Edit". Update any fields you need to change. Edits are only allowed while the application is in Draft or Need More Info status.'
},
{
  icon: Send,
  title: 'Submitting an application',
  description:
  'When your draft is complete, click "Submit". The application moves into the review queue and is locked from further edits until a reviewer takes action.',
  tip: 'Double-check all details before submitting — you cannot edit a submitted application unless a reviewer requests more information.'
},
{
  icon: PlayCircle,
  title: 'Starting a review',
  description:
  'Reviewers can open any Submitted application and click "Start Review". This moves the application to Under Review status and signals that examination is in progress.'
},
{
  icon: CheckCircle,
  title: 'Making a decision',
  description:
  'Once Under Review, a reviewer can Approve, Reject, or request Need More Info. Reject and Need More Info both require a written comment explaining the decision.',
  tip: 'Approved and Rejected are terminal — they cannot be changed afterward.'
},
{
  icon: RefreshCw,
  title: 'Resubmitting after Need More Info',
  description:
  'If a reviewer requests more information, the application returns to your queue. Read the reviewer comment, click "Edit" to address the issue, then click "Resubmit" to send it back for review.'
},
{
  icon: Grid3x3,
  title: 'Using the Kanban board',
  description:
  'The Kanban board shows all applications grouped by status. Drag a card between columns to update its status — invalid moves are blocked automatically. Click the eye icon on any card to open its full detail page.',
  tip: 'Only valid workflow transitions are allowed. The board enforces the same rules as the action buttons.'
},
{
  icon: Eye,
  title: 'Viewing application details',
  description:
  'Click any application from the list, dashboard, or Kanban card to see its full details — including the activity timeline showing every status change, reviewer comments, and timestamps.'
},
{
  icon: Trash2,
  title: 'Deleting or withdrawing',
  description:
  'Drafts you no longer need can be deleted permanently from the detail page. Submitted applications can be withdrawn back to Draft if you need to make further changes before review begins.'
}];

export function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">User Guide</h1>
        <p className="text-sm text-text-secondary mt-1">
          Step-by-step instructions for managing intellectual property
          applications
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card key={index} className="p-5">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded flex items-center justify-center">
                    <Icon size={18} className="text-accent" />
                  </div>
                  <div className="mt-2 text-xs font-mono text-text-secondary">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                    {step.description}
                  </p>
                  {step.tip &&
                  <div className="mt-3 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-l-2 border-accent rounded-sm">
                      <p className="text-xs text-text-secondary">
                        <span className="font-semibold text-text-primary">
                          Tip:{' '}
                        </span>
                        {step.tip}
                      </p>
                    </div>
                  }
                </div>
              </div>
            </Card>);

        })}
      </div>
    </div>);

}