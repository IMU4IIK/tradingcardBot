import { Card, CardContent } from "@/components/ui/card";
import { BOT_COMMANDS } from "@/lib/constants";

export default function BotCommands() {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold font-inter">Bot Commands</h3>
        <a href="#" className="text-telegram-blue hover:underline text-sm font-medium">
          View All Commands
        </a>
      </div>
      
      <Card className="bg-white rounded-lg shadow p-4">
        <CardContent className="p-0">
          <p className="mb-4 text-gray-600">
            Use these commands with our Telegram bot to get card information directly in your chats:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BOT_COMMANDS.map((command, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-3 hover:bg-telegram-hover transition-colors duration-300"
              >
                <p className="font-mono text-gray-800 font-medium">{command.command}</p>
                <p className="text-sm text-gray-600 mt-1">{command.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
