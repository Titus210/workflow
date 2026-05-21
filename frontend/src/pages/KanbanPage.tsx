import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, MoreVertical, Undo2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects } from
'@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable } from
'@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  getApplications,
  updateApplicationStatus,
  submitApplication,
  startReview,
  makeDecision,
  withdrawApplication,
  deleteApplication } from
'../api/applicationsApi';
import { Application, Status } from '../types/application';
import {
  statusLabels,
  allowedTransitions,
  getActionButtons } from
'../lib/statusUtils';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Tooltip } from '../components/ui/Tooltip';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ReviewerDecisionModal } from '../components/applications/ReviewerDecisionModal';
// =====================
// Card with action menu
// =====================
interface CardProps {
  application: Application;
  onView: (id: string) => void;
  onAction: (app: Application, action: string) => void;
}
function SortableApplicationCard({ application, onView, onAction }: CardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: application.id,
    data: {
      type: 'Application',
      application
    }
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);
  const actions = getActionButtons(application.status);
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card-bg p-3 rounded border border-border-color mb-2 hover:border-accent transition-colors group relative">
      
      <div className="flex justify-between items-start mb-2 gap-2">
        <span
          className="text-xs font-mono text-accent flex-1 truncate cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}>
          
          {application.trackingNumber}
        </span>

        <div className="flex items-center gap-1">
          <Tooltip content="View application">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(application.id);
              }}
              className="text-text-secondary hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="View application">
              
              <Eye size={14} />
            </button>
          </Tooltip>

          {actions.length > 0 &&
          <div ref={menuRef} className="relative">
              <Tooltip content="Actions">
                <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                className="text-text-secondary hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Application actions">
                
                  <MoreVertical size={14} />
                </button>
              </Tooltip>

              {menuOpen &&
            <div className="absolute right-0 top-5 z-30 min-w-[180px] bg-card-bg border border-border-color rounded shadow-sm py-1">
                  {actions.map((action) =>
              <button
                key={action.action}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onAction(application, action.action);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${action.variant === 'danger' ? 'text-error' : 'text-text-primary'}`}>
                
                      {action.label}
                    </button>
              )}
                </div>
            }
            </div>
          }
        </div>
      </div>

      <div
        className="cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}>
        
        <p className="text-sm font-medium text-text-primary truncate">
          {application.applicantName}
        </p>
        <p className="text-xs text-text-secondary mt-1 truncate">
          {application.applicationType}
        </p>
        <div className="mt-2">
          <StatusBadge status={application.status} />
        </div>
      </div>
    </div>);

}
// =====================
// Column
// =====================
interface ColumnProps {
  status: Status;
  applications: Application[];
  onView: (id: string) => void;
  onAction: (app: Application, action: string) => void;
}
function KanbanColumn({ status, applications, onView, onAction }: ColumnProps) {
  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-800/30 rounded p-3 min-w-[280px] w-[280px] border border-border-color">
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="text-sm font-semibold text-text-primary">
          {statusLabels[status]}
        </h3>
        <span className="text-xs font-medium bg-card-bg border border-border-color text-text-secondary px-2 py-0.5 rounded-sm">
          {applications.length}
        </span>
      </div>

      <SortableContext
        id={status}
        items={applications.map((a) => a.id)}
        strategy={verticalListSortingStrategy}>
        
        <div className="flex-1 min-h-[150px]">
          {applications.length === 0 ?
          <div className="text-xs text-text-secondary text-center py-6 border border-dashed border-border-color rounded-sm">
              No applications
            </div> :

          applications.map((app) =>
          <SortableApplicationCard
            key={app.id}
            application={app}
            onView={onView}
            onAction={onAction} />

          )
          }
        </div>
      </SortableContext>
    </div>);

}
// =====================
// Pending action types
// =====================
type PendingAction =
{
  kind: 'confirm';
  app: Application;
  action: 'submit' | 'start-review' | 'resubmit' | 'withdraw' | 'delete';
  fromStatus: Status;
} |
{
  kind: 'decision';
  app: Application;
  decision: 'APPROVED' | 'REJECTED' | 'NEED_MORE_INFO';
  fromStatus: Status;
};
interface UndoState {
  app: Application; // snapshot before the change
  newStatus: Status;
}
// =====================
// Main Kanban Page
// =====================
export function KanbanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isReviewer = user?.role === 'Reviewer' || user?.role === 'Admin';
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [processing, setProcessing] = useState(false);
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor)
  );
  const columns = [
  Status.DRAFT,
  Status.SUBMITTED,
  Status.UNDER_REVIEW,
  Status.NEED_MORE_INFO,
  Status.APPROVED,
  Status.REJECTED];

  const reviewerOnlyTargets = new Set<Status>([
    Status.UNDER_REVIEW,
    Status.NEED_MORE_INFO,
    Status.APPROVED,
    Status.REJECTED
  ]);

  useEffect(() => {
    loadApplications();
  }, []);
  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data } = await getApplications();
      setApplications(data);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };
  const handleView = (id: string) => {
    navigate(`/applications/${id}`);
  };
  // -----------------------------------------------------
  // Resolve a (fromStatus, toStatus) drop to a PendingAction
  // -----------------------------------------------------
  const resolveDropToAction = (
  app: Application,
  toStatus: Status)
  : PendingAction | null => {
    const from = app.status;
    if (from === Status.DRAFT && toStatus === Status.SUBMITTED) {
      return {
        kind: 'confirm',
        app,
        action: 'submit',
        fromStatus: from
      };
    }
    if (from === Status.NEED_MORE_INFO && toStatus === Status.SUBMITTED) {
      return {
        kind: 'confirm',
        app,
        action: 'resubmit',
        fromStatus: from
      };
    }
    if (from === Status.SUBMITTED && toStatus === Status.UNDER_REVIEW) {
      return {
        kind: 'confirm',
        app,
        action: 'start-review',
        fromStatus: from
      };
    }
    if (from === Status.SUBMITTED && toStatus === Status.DRAFT) {
      return {
        kind: 'confirm',
        app,
        action: 'withdraw',
        fromStatus: from
      };
    }
    if (
    from === Status.UNDER_REVIEW && (
    toStatus === Status.APPROVED ||
    toStatus === Status.REJECTED ||
    toStatus === Status.NEED_MORE_INFO))
    {
      return {
        kind: 'decision',
        app,
        decision: toStatus as 'APPROVED' | 'REJECTED' | 'NEED_MORE_INFO',
        fromStatus: from
      };
    }
    return null;
  };
  // -----------------------------------------------------
  // Drag-end
  // -----------------------------------------------------
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeApp = active.data.current?.application as Application;
    const overId = over.id as string;
    let targetStatus: Status;
    if (columns.includes(overId as Status)) {
      targetStatus = overId as Status;
    } else {
      const overApp = applications.find((a) => a.id === overId);
      if (!overApp) return;
      targetStatus = overApp.status;
    }
    if (activeApp.status === targetStatus) return;

    if (reviewerOnlyTargets.has(targetStatus) && !isReviewer) {
      toast.error('Reviewer access required for that move');
      return;
    }

    const allowed = allowedTransitions[activeApp.status];
    if (!allowed.includes(targetStatus)) {
      toast.error(
        `Cannot move from ${statusLabels[activeApp.status]} to ${statusLabels[targetStatus]}`
      );
      return;
    }
    const action = resolveDropToAction(activeApp, targetStatus);
    if (!action) {
      toast.error('Invalid transition');
      return;
    }
    setPending(action);
  };
  // -----------------------------------------------------
  // Trigger a workflow action from the card menu
  // -----------------------------------------------------
  const handleCardAction = (app: Application, action: string) => {
    if (action === 'edit') {
      navigate(`/applications/${app.id}/edit`);
      return;
    }

    const reviewerActions = new Set(['start-review', 'approve', 'reject', 'need-info']);
    if (reviewerActions.has(action) && !isReviewer) {
      toast.error('Reviewer access required for that action');
      return;
    }

    if (action === 'submit') {
      setPending({
        kind: 'confirm',
        app,
        action: 'submit',
        fromStatus: app.status
      });
    } else if (action === 'resubmit') {
      setPending({
        kind: 'confirm',
        app,
        action: 'resubmit',
        fromStatus: app.status
      });
    } else if (action === 'start-review') {
      setPending({
        kind: 'confirm',
        app,
        action: 'start-review',
        fromStatus: app.status
      });
    } else if (action === 'withdraw') {
      setPending({
        kind: 'confirm',
        app,
        action: 'withdraw',
        fromStatus: app.status
      });
    } else if (action === 'delete') {
      setPending({
        kind: 'confirm',
        app,
        action: 'delete',
        fromStatus: app.status
      });
    } else if (action === 'approve') {
      setPending({
        kind: 'decision',
        app,
        decision: 'APPROVED',
        fromStatus: app.status
      });
    } else if (action === 'reject') {
      setPending({
        kind: 'decision',
        app,
        decision: 'REJECTED',
        fromStatus: app.status
      });
    } else if (action === 'need-info') {
      setPending({
        kind: 'decision',
        app,
        decision: 'NEED_MORE_INFO',
        fromStatus: app.status
      });
    }
  };
  // -----------------------------------------------------
  // Execute the confirmed action
  // -----------------------------------------------------
  const executeConfirm = async () => {
    if (!pending || pending.kind !== 'confirm') return;
    const { app, action } = pending;
    setProcessing(true);
    const snapshot = {
      ...app
    };
    try {
      let updated: Application | null = null;
      if (action === 'submit' || action === 'resubmit') {
        updated = await submitApplication(app.id);
      } else if (action === 'start-review') {
        updated = await startReview(app.id);
      } else if (action === 'withdraw') {
        updated = await withdrawApplication(app.id);
      } else if (action === 'delete') {
        await deleteApplication(app.id);
        setApplications((apps) => apps.filter((a) => a.id !== app.id));
        toast.success('Application deleted');
        setPending(null);
        setUndoState(null); // can't undo deletes here
        return;
      }
      if (updated) {
        setApplications((apps) =>
        apps.map((a) => a.id === app.id ? updated! : a)
        );
        const reversible =
          (snapshot.status === Status.DRAFT && updated.status === Status.SUBMITTED) ||
          (snapshot.status === Status.SUBMITTED && updated.status === Status.DRAFT) ||
          (snapshot.status === Status.NEED_MORE_INFO && updated.status === Status.SUBMITTED) ||
          (snapshot.status === Status.SUBMITTED && updated.status === Status.NEED_MORE_INFO);
        setUndoState(reversible ? { app: snapshot, newStatus: updated.status } : null);
        toast.success(`Moved to ${statusLabels[updated.status]}`);
      }
      setPending(null);
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };
  const executeDecision = async (decision: string, comment: string) => {
    if (!pending || pending.kind !== 'decision') return;
    const { app } = pending;
    setProcessing(true);
    const snapshot = {
      ...app
    };
    try {
      const updated = await makeDecision(app.id, decision, comment);
      setApplications((apps) =>
      apps.map((a) => a.id === app.id ? updated : a)
      );
      // Reviewer decisions are not reversible in the workflow.
      setUndoState(null);
      toast.success(`Application ${statusLabels[updated.status].toLowerCase()}`);
      setPending(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit decision');
    } finally {
      setProcessing(false);
    }
  };
  // -----------------------------------------------------
  // Undo last action
  // -----------------------------------------------------
  const handleUndo = async () => {
    if (!undoState) return;
    const { app: snapshot } = undoState;
    setProcessing(true);
    try {
      // Only reversible actions are stored in undoState.
      if (snapshot.status === Status.DRAFT) await withdrawApplication(snapshot.id);
      else if (snapshot.status === Status.SUBMITTED) await submitApplication(snapshot.id);
      else if (snapshot.status === Status.NEED_MORE_INFO) await submitApplication(snapshot.id);
      // Restore the full snapshot locally so reviewer fields etc come back
      setApplications((apps) =>
      apps.map((a) => a.id === snapshot.id ? snapshot : a)
      );
      toast.success(`Reverted to ${statusLabels[snapshot.status]}`);
      setUndoState(null);
    } catch (error) {
      toast.error('Failed to undo');
    } finally {
      setProcessing(false);
    }
  };
  // -----------------------------------------------------
  // Confirm modal copy
  // -----------------------------------------------------
  const getConfirmCopy = () => {
    if (!pending || pending.kind !== 'confirm') return null;
    const tn = pending.app.trackingNumber;
    switch (pending.action) {
      case 'submit':
        return {
          title: 'Submit application?',
          subtitle: tn,
          message:
          'Submitting will move this application into the review queue and lock it from further edits until a reviewer takes action.',
          confirmLabel: 'Submit',
          variant: 'primary' as const
        };
      case 'resubmit':
        return {
          title: 'Resubmit application?',
          subtitle: tn,
          message:
          'This will send the updated application back for review. Make sure you have addressed the reviewer comments.',
          confirmLabel: 'Resubmit',
          variant: 'primary' as const
        };
      case 'start-review':
        return {
          title: 'Start review?',
          subtitle: tn,
          message:
          'This will mark the application as Under Review and assign it to you.',
          confirmLabel: 'Start Review',
          variant: 'primary' as const
        };
      case 'withdraw':
        return {
          title: 'Withdraw application?',
          subtitle: tn,
          message:
          'This will move the application back to Draft status so it can be edited.',
          confirmLabel: 'Withdraw',
          variant: 'primary' as const
        };
      case 'delete':
        return {
          title: 'Delete draft?',
          subtitle: tn,
          message:
          'This permanently deletes the draft. This action cannot be undone.',
          confirmLabel: 'Delete',
          variant: 'danger' as const
        };
    }
  };
  const activeApp = activeId ?
  applications.find((a) => a.id === activeId) :
  null;
  const confirmCopy = getConfirmCopy();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        Loading board...
      </div>);

  }
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Kanban Board
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Drag cards to change status, or open the actions menu on any card.
          </p>
        </div>
        <Tooltip
          content={
          undoState ?
          `Undo last change (back to ${statusLabels[undoState.app.status]})` :
          'Nothing to undo'
          }>
          
          <Button
            variant="secondary"
            onClick={handleUndo}
            disabled={!undoState || processing}>
            
            <Undo2 size={14} className="mr-2 inline" />
            Undo
          </Button>
        </Tooltip>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full items-start min-w-max">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}>
            
            {columns.map((status) =>
            <KanbanColumn
              key={status}
              status={status}
              applications={applications.filter((a) => a.status === status)}
              onView={handleView}
              onAction={handleCardAction} />

            )}

            <DragOverlay
              dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: {
                    active: {
                      opacity: '0.4'
                    }
                  }
                })
              }}>
              
              {activeApp ?
              <div className="bg-card-bg p-3 rounded border-2 border-accent w-[260px] opacity-90">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-accent">
                      {activeApp.trackingNumber}
                    </span>
                    <StatusBadge status={activeApp.status} />
                  </div>
                  <p className="text-sm font-medium text-text-primary truncate">
                    {activeApp.applicantName}
                  </p>
                </div> :
              null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Confirmation modal for simple transitions */}
      {confirmCopy &&
      <ConfirmModal
        isOpen={pending?.kind === 'confirm'}
        onClose={() => !processing && setPending(null)}
        onConfirm={executeConfirm}
        title={confirmCopy.title}
        subtitle={confirmCopy.subtitle}
        message={confirmCopy.message}
        confirmLabel={confirmCopy.confirmLabel}
        variant={confirmCopy.variant}
        loading={processing} />

      }

      {/* Reviewer decision modal for decisions */}
      {pending?.kind === 'decision' &&
      <ReviewerDecisionModal
        isOpen={true}
        onClose={() => !processing && setPending(null)}
        trackingNumber={pending.app.trackingNumber}
        onSubmit={executeDecision}
        initialDecision={pending.decision}
        lockDecision={true} />

      }
    </div>);

}
