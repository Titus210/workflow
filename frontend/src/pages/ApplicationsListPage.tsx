import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterBar } from '../components/applications/FilterBar';
import { ApplicationsTable } from '../components/applications/ApplicationsTable';
import { Pagination } from '../components/applications/Pagination';
import { getApplications } from '../api/applicationsApi';
import { Application } from '../types/application';
export function ApplicationsListPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  useEffect(() => {
    loadApplications();
  }, []);
  useEffect(() => {
    filterApplications();
  }, [applications, status, search, currentPage]);
  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data } = await getApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };
  const filterApplications = () => {
    let filtered = [...applications];
    if (status !== 'all') {
      filtered = filtered.filter((app) => app.status === status);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (app) =>
        app.trackingNumber.toLowerCase().includes(searchLower) ||
        app.applicantName.toLowerCase().includes(searchLower) ||
        app.companyName.toLowerCase().includes(searchLower)
      );
    }
    setFilteredApps(filtered);
  };
  const handleClearFilters = () => {
    setStatus('all');
    setSearch('');
    setCurrentPage(1);
  };
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading applications...</div>
      </div>);

  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Applications
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage all intellectual property applications
          </p>
        </div>
        <Button onClick={() => navigate('/applications/create')}>
          <Plus size={16} className="mr-2" />
          New Application
        </Button>
      </div>

      <FilterBar
        status={status}
        search={search}
        onStatusChange={setStatus}
        onSearchChange={setSearch}
        onClear={handleClearFilters} />
      

      {filteredApps.length === 0 ?
      <EmptyState
        icon={FileText}
        title="No applications found"
        description="No applications match your current filters. Try adjusting your search criteria."
        action={{
          label: 'Clear Filters',
          onClick: handleClearFilters
        }} /> :


      <>
          <ApplicationsTable applications={paginatedApps} />
          <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredApps.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage} />
        
        </>
      }
    </div>);

}