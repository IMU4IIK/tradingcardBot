import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function AboutCredits() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>About Trading Card Market</CardTitle>
        <CardDescription>
          Real-time market data and price tracking for collectible trading cards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Created By</h3>
            <p className="text-gray-600">
              Jeremy Bosch
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Features</h3>
            <ul className="list-disc pl-5 text-gray-600">
              <li>Track price trends for Pokémon, Yu-Gi-Oh!, TCG, and Topps cards</li>
              <li>Real-time market data and price notifications</li>
              <li>Save your favorite cards to a personalized watchlist</li>
              <li>Telegram bot integration for price alerts</li>
              <li>Search and filter through thousands of collectible cards</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Version</h3>
            <p className="text-gray-600">
              1.0.0
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}