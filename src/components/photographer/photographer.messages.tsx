import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MessageType {
  id: number;
  from: string;
  subject: string;
  received: string;
  read: boolean;
}

interface PhotographerMessagesProps {
  messages: MessageType[];
  onReplyMessage: (messageId: number) => void;
  onMarkAsRead: (messageId: number) => void;
}

const PhotographerMessages: React.FC<PhotographerMessagesProps> = ({
  messages,
  onReplyMessage,
  onMarkAsRead
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>
          Manage communications with clients and admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`border rounded-lg p-4 ${!message.read ? 'bg-blue-50' : ''}`}
                onClick={() => !message.read && onMarkAsRead(message.id)}
              >
                <div className="flex justify-between items-center">
                  <h3 className={`font-medium ${!message.read ? 'font-semibold' : ''}`}>{message.from}</h3>
                  <span className="text-xs text-gray-500">{message.received}</span>
                </div>
                <p className="text-sm mt-1">{message.subject}</p>
                <div className="mt-3 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onReplyMessage(message.id)}
                  >
                    Reply
                  </Button>
                  {!message.read && <Badge>New</Badge>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">No messages found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotographerMessages;