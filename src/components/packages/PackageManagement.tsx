import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import packageService, { Package } from "@/services/packageService";
import PackageForm from "./PackageForm";

interface PackageManagementProps {
  refreshDashboard?: () => void;
}

const PackageManagement: React.FC<PackageManagementProps> = ({ refreshDashboard }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState<Package | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      console.log("Fetching packages...");
      const data = await packageService.getPhotographerPackages();
      console.log("Fetched packages:", data);
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({
        title: "Error",
        description: "Failed to load packages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleAddPackage = () => {
    if (packages.length >= 3) {
      toast({
        title: "Limit Reached",
        description: "You can only create up to 3 packages.",
        variant: "destructive",
      });
      return;
    }
    setPackageToEdit(null);
    setShowPackageForm(true);
  };

  const handleEditPackage = (pkg: Package) => {
    setPackageToEdit(pkg);
    setShowPackageForm(true);
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm("Are you sure you want to delete this package?")) {
      return;
    }

    try {
      await packageService.deletePackage(packageId);
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
      fetchPackages();
      if (refreshDashboard) refreshDashboard();
    } catch (error) {
      console.error("Error deleting package:", error);
      toast({
        title: "Error",
        description: "Failed to delete package. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async () => {
    await fetchPackages();
    setShowPackageForm(false);
    if (refreshDashboard) refreshDashboard();
  };

  const getPriceDisplay = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Packages</CardTitle>
            <CardDescription>
              Create up to 3 packages for clients to book
            </CardDescription>
          </div>
          <Button onClick={handleAddPackage} disabled={packages.length >= 3}>
            Add Package
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6">
              <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading packages...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-md">
              <p className="text-gray-500 mb-4">You haven't created any packages yet.</p>
              <Button onClick={handleAddPackage}>Create Your First Package</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg._id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-xl font-semibold">{pkg.name}</h3>
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold mb-2">{getPriceDisplay(pkg.price)}</div>
                    <p className="text-sm text-gray-500 mb-2">{pkg.duration}</p>
                    <p className="text-sm mb-4">{pkg.description}</p>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Includes:</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        {pkg.includes.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPackage(pkg)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePackage(pkg._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showPackageForm && (
        <PackageForm
          isOpen={showPackageForm}
          onClose={() => setShowPackageForm(false)}
          onSubmit={handleFormSubmit}
          packageToEdit={packageToEdit}
        />
      )}
    </>
  );
};

export default PackageManagement;