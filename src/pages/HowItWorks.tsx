
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const HowItWorks = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  
  // Check if the role is valid
  const validRole = role === "user" || role === "photographer" || role === "admin";
  const displayRole = role?.charAt(0).toUpperCase() + role?.slice(1);
  
  // Define content for each role
  const roleContent = {
    user: [
      {
        title: "Find the Perfect Photographer",
        description: "Browse through our diverse collection of professional photographers. Filter by specialty, location, or price range to find the perfect match for your needs.",
        icon: "🔍"
      },
      {
        title: "Book Your Session",
        description: "Select your preferred date and time slot, then proceed to booking. Our calendar system shows real-time availability of photographers.",
        icon: "📅"
      },
      {
        title: "Receive Confirmation",
        description: "Once your booking is confirmed, you'll receive an email and SMS notification with all the details of your session.",
        icon: "✉️"
      },
      {
        title: "Enjoy Your Photoshoot",
        description: "Meet with your photographer at the scheduled time and location. They'll capture your special moments professionally.",
        icon: "📸"
      },
      {
        title: "Access Your Photos",
        description: "After your session, you'll be able to view, download, and share your photos through your user dashboard.",
        icon: "🖼️"
      }
    ],
    photographer: [
      {
        title: "Create Your Professional Profile",
        description: "Set up your professional profile showcasing your portfolio, expertise, pricing, and availability to attract potential clients.",
        icon: "👤"
      },
      {
        title: "Manage Your Calendar",
        description: "Set your availability using our calendar system. Block off dates you're not available and see upcoming bookings.",
        icon: "📅"
      },
      {
        title: "Receive Booking Requests",
        description: "Get notified instantly when clients book your services. Accept or decline based on your availability.",
        icon: "🔔"
      },
      {
        title: "Conduct Photo Sessions",
        description: "Meet your clients and deliver an exceptional photography experience according to their needs.",
        icon: "📸"
      },
      {
        title: "Upload and Share Photos",
        description: "After completing a session, upload the photos to the platform for clients to view and download. Receive payment upon completion.",
        icon: "💾"
      }
    ],
    admin: [
      {
        title: "User Management",
        description: "Oversee all registered users on the platform. Add, edit, or deactivate user accounts as needed.",
        icon: "👥"
      },
      {
        title: "Photographer Management",
        description: "Manage photographer profiles, verify their credentials, and ensure quality control across the platform.",
        icon: "📷"
      },
      {
        title: "Booking Overview",
        description: "Monitor all bookings on the platform. Resolve any issues, manage conflicts, and ensure smooth operations.",
        icon: "📊"
      },
      {
        title: "System Configuration",
        description: "Configure system settings including notification preferences, photography categories, and pricing guidelines.",
        icon: "⚙️"
      },
      {
        title: "Analytics & Reporting",
        description: "Access platform analytics to track user engagement, booking patterns, and revenue generation.",
        icon: "📈"
      }
    ]
  };
  
  // Navigate back based on role
  const navigateBack = () => {
    switch(role) {
      case "user":
        navigate("/photographers");
        break;
      case "photographer":
        navigate("/dashboard");
        break;
      case "admin":
        navigate("/admin");
        break;
      default:
        navigate("/");
    }
  };
  
  const getContent = () => {
    if (!validRole) {
      return roleContent.user; // Default to user if role is invalid
    }
    return roleContent[role as keyof typeof roleContent];
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={navigateBack}
            className="mb-6"
          >
            ← Back
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">
            How It Works {validRole ? `for ${displayRole}s` : ""}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {role === "user" && "Find and book your perfect photography session in a few simple steps."}
            {role === "photographer" && "Showcase your talent and manage your photography business with ease."}
            {role === "admin" && "Efficiently manage the platform and ensure smooth operations for all users."}
            {!validRole && "Find and book your perfect photography session in a few simple steps."}
          </p>
          
          <div className="space-y-6">
            {getContent().map((item, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{item.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{index + 1}. {item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <h3 className="text-xl font-semibold mb-4">Ready to Get Started?</h3>
            <Button 
              onClick={navigateBack}
              size="lg"
              className="px-8"
            >
              {role === "user" && "Find a Photographer"}
              {role === "photographer" && "Go to Dashboard"}
              {role === "admin" && "Go to Admin Panel"}
              {!validRole && "Find a Photographer"}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default HowItWorks;
