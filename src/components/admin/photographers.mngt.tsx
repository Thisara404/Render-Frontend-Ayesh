import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import AdminAddNewForm from "@/components/AdminAddNewForm";
import AdminEditForm from "@/components/AdminEditForm";
import adminService, { PhotographerData } from "@/services/adminService";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface Photographer {
  _id: string;
  fullName: string;
  email: string;
  specialty?: string;
  bookings?: number;
  rating?: number;
  status?: string;
}

interface PhotographersManagementProps {
  searchTerm: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PhotographersManagement: React.FC<PhotographersManagementProps> = ({ searchTerm }) => {
  const [photographers, setPhotographers] = useState<PhotographerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPhotographerForm, setShowAddPhotographerForm] = useState(false);
  const [selectedPhotographerToEdit, setSelectedPhotographerToEdit] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch photographers from API
  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        setLoading(true);
        const data = await adminService.getPhotographers();
        setPhotographers(data);
      } catch (error) {
        console.error('Failed to fetch photographers:', error);
        toast({
          title: "Error",
          description: "Failed to fetch photographers. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPhotographers();
  }, []);
  
  // Delete photographer mutation
  const deletePhotographerMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axios.delete(`${API_URL}/admin/photographers/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photographers'] });
      toast({
        title: "Photographer deleted",
        description: "The photographer has been successfully removed from the system.",
      });
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete photographer",
        variant: "destructive",
      });
    }
  });
  
  // Handle delete confirmation
  const handleConfirmDelete = (id: string) => {
    setConfirmDelete(id);
  };
  
  // Execute actual deletion
  const handleDelete = async (id: string) => {
    try {
      await deletePhotographerMutation.mutateAsync(id);
    } finally {
      setConfirmDelete(null);
    }
  };
  
  // Get photographer data for edit form
  const getPhotographerToEdit = () => {
    return photographers.find(photographer => photographer._id === selectedPhotographerToEdit);
  };
  
  // Filter photographers based on search term
  const filteredPhotographers = photographers.filter(photographer => 
    photographer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    photographer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (photographer.specialty && photographer.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <CardTitle>Photographer Management</CardTitle>
              <CardDescription>
                Manage all photographers registered on the platform.
              </CardDescription>
            </div>
            <Button 
              className="mt-4 md:mt-0"
              onClick={() => setShowAddPhotographerForm(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Photographer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-gray-500">Loading photographers...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPhotographers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? "No photographers matching your search" : "No photographers found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPhotographers.map(photographer => (
                    <TableRow key={photographer._id}>
                      <TableCell className="font-mono text-sm">{photographer._id.substring(0, 8)}...</TableCell>
                      <TableCell>{photographer.fullName}</TableCell>
                      <TableCell>{photographer.email}</TableCell>
                      <TableCell>{photographer.specialty || "Not specified"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${photographer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {photographer.status || 'active'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedPhotographerToEdit(photographer._id)}
                          >
                            Edit
                          </Button>
                          
                          {confirmDelete === photographer._id ? (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDelete(photographer._id)}
                                disabled={deletePhotographerMutation.isPending}
                              >
                                {deletePhotographerMutation.isPending ? 'Deleting...' : 'Confirm'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setConfirmDelete(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500"
                              onClick={() => handleConfirmDelete(photographer._id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <AdminAddNewForm 
        type="photographer" 
        isOpen={showAddPhotographerForm} 
        onClose={() => setShowAddPhotographerForm(false)} 
      />
      
      {selectedPhotographerToEdit && getPhotographerToEdit() && (
        <AdminEditForm 
          type="photographer" 
          isOpen={selectedPhotographerToEdit !== null} 
          onClose={() => setSelectedPhotographerToEdit(null)} 
          data={getPhotographerToEdit()!} 
        />
      )}
    </>
  );
};

export default PhotographersManagement;