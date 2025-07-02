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
import { Badge } from "@/components/ui/badge";
import AdminAddNewForm from "@/components/AdminAddNewForm";
import AdminEditForm from "@/components/AdminEditForm";
import adminService, { UserData } from "@/services/adminService";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
}

interface UsersManagementProps {
  searchTerm: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UsersManagement: React.FC<UsersManagementProps> = ({ searchTerm }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await adminService.getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axios.delete(`${API_URL}/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User deleted",
        description: "The user has been successfully removed from the system.",
      });
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
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
      await deleteUserMutation.mutateAsync(id);
    } finally {
      setConfirmDelete(null);
    }
  };
  
  // Get user data for edit form
  const getUserToEdit = () => {
    return users.find(user => user._id === selectedUserToEdit);
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusBadgeColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active':
        return "bg-green-500";
      case 'inactive':
        return "bg-red-500";
      case 'pending':
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage all registered users on the platform.
              </CardDescription>
            </div>
            <Button 
              className="mt-4 md:mt-0"
              onClick={() => setShowAddUserForm(true)}
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
              Add New User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-gray-500">Loading users...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? "No users matching your search" : "No users found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user._id}>
                      <TableCell className="font-mono text-sm">{user._id.substring(0, 8)}...</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUserToEdit(user._id)}
                          >
                            Edit
                          </Button>
                          
                          {confirmDelete === user._id ? (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDelete(user._id)}
                                disabled={deleteUserMutation.isPending}
                              >
                                {deleteUserMutation.isPending ? 'Deleting...' : 'Confirm'}
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
                              onClick={() => handleConfirmDelete(user._id)}
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
        type="user" 
        isOpen={showAddUserForm} 
        onClose={() => setShowAddUserForm(false)} 
      />
      
      {selectedUserToEdit && getUserToEdit() && (
        <AdminEditForm 
          type="user" 
          isOpen={selectedUserToEdit !== null} 
          onClose={() => setSelectedUserToEdit(null)} 
          data={getUserToEdit()!} 
        />
      )}
    </>
  );
};

export default UsersManagement;