import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CollectionType {
  id: number;
  title: string;
  images: number;
  views: number;
  coverImage?: string;
}

interface PhotographerPortfolioProps {
  collections: CollectionType[];
  onNewCollection: () => void;
  onEditCollection: (collectionId: number) => void;
  onViewCollection: (collectionId: number) => void;
}

const PhotographerPortfolio: React.FC<PhotographerPortfolioProps> = ({
  collections,
  onNewCollection,
  onEditCollection,
  onViewCollection
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <CardTitle>Your Portfolio</CardTitle>
            <CardDescription>
              Manage your photography collections.
            </CardDescription>
          </div>
          <Button className="mt-4 md:mt-0" onClick={onNewCollection}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Collection
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map(collection => (
              <Card key={collection.id} className="overflow-hidden">
                <div className="h-48 bg-gray-200 relative">
                  {collection.coverImage ? (
                    <img 
                      src={collection.coverImage} 
                      alt={collection.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <CardContent>
                  <h3 className="font-semibold text-lg mb-1">{collection.title}</h3>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{collection.images} Images</span>
                    <span>{collection.views} Views</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onEditCollection(collection.id)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onViewCollection(collection.id)}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-gray-500">No collections yet.</p>
            <Button className="mt-4" onClick={onNewCollection}>Create Your First Collection</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotographerPortfolio;