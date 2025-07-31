import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileProcessed: (data: any) => void;
}

export const FileUpload = ({ onFileProcessed }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processWhatsAppFile = useCallback((file: File) => {
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Basic WhatsApp chat parsing
        const lines = content.split('\n').filter(line => line.trim());
        const messages: any[] = [];
        
        lines.forEach(line => {
          // WhatsApp format: [date, time] Contact Name: message
          const match = line.match(/^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\]?\s*-?\s*([^:]+):\s*(.+)$/);
          
          if (match) {
            const [, date, time, contact, message] = match;
            messages.push({
              date,
              time,
              contact: contact.trim(),
              message: message.trim(),
              timestamp: new Date(`${date} ${time}`)
            });
          }
        });
        
        if (messages.length === 0) {
          throw new Error('No valid WhatsApp messages found');
        }
        
        toast({
          title: "Chat processed successfully!",
          description: `Found ${messages.length} messages`,
        });
        
        onFileProcessed(messages);
      } catch (error) {
        toast({
          title: "Error processing file",
          description: "Please make sure you uploaded a valid WhatsApp chat export",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.readAsText(file);
  }, [onFileProcessed, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      processWhatsAppFile(file);
    }
  }, [processWhatsAppFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processWhatsAppFile(file);
    }
  }, [processWhatsAppFile]);

  return (
    <Card className="stats-card border-2 border-dashed border-border/50 hover:border-primary/50 transition-all duration-300">
      <CardContent className="p-8">
        <div
          className={`relative min-h-[200px] flex flex-col items-center justify-center space-y-4 ${
            isDragging ? 'bg-primary/10' : ''
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {isProcessing ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              ) : (
                <Upload className="h-12 w-12 text-primary" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Upload WhatsApp Chat</h3>
              <p className="text-muted-foreground">
                {isProcessing 
                  ? 'Processing your chat...' 
                  : 'Drag and drop your WhatsApp chat export file here'
                }
              </p>
            </div>
            
            {!isProcessing && (
              <>
                <Button asChild className="cursor-pointer">
                  <label>
                    <FileText className="mr-2 h-4 w-4" />
                    Choose File
                    <input
                      type="file"
                      accept=".txt,.zip"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </Button>
                
                <div className="flex items-start space-x-2 mt-4 p-3 bg-muted/30 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">How to export WhatsApp chat:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Open your WhatsApp chat</li>
                      <li>Tap the contact/group name</li>
                      <li>Scroll down and tap "Export Chat"</li>
                      <li>Choose "Without Media" and save as .txt file</li>
                    </ol>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};