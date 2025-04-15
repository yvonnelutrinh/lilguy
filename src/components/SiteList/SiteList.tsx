import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Label } from "@/components/ui/Label/Label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/Select/Select";
import { Trash, Plus } from "lucide-react";
import { User } from '@clerk/nextjs/server';
import { api } from '../../../convex/_generated/api';
import { useQuery } from 'convex/react';
import { Id } from '../../../convex/_generated/dataModel';


interface Sitevisit {
  _id: Id<"sitevisits">;
  _creationTime: number;
  classification: string;
  hostname: string;
  sessions: number;
  totalDuration: number;
  userId: string;
  visits: number;
} 
// TODO: remove placeholder sites
const initialWebsites: Sitevisit[] = [
  {
    _id: "j97d6vkyrtb7rrv5pspp9cy8tx7e0hkg" as Id<"sitevisits">,
    classification: "productive",
    hostname: "stackoverflow.com",
    sessions: 1,
    totalDuration: 60,
    userId: "clerk:user_2vhLHFwbblBU9J4M5qWkEKQKcFK", //fake user id
    visits: 1,
    _creationTime: 1744592598694.1118,
  },
  {
    _id: "j97d6vkyrtb7rrv5pspp9cy8tx7e0hkh" as Id<"sitevisits">,
    classification: "productive",
    hostname: "github.com",
    sessions: 1,
    totalDuration: 120,
    userId: "clerk:user_2vhLHFwbblBU9J4M5qWkEKQKcFK", //fake use
    visits: 1,
    _creationTime: 1744592598694.1118,
  },
  {
    _id: "j97d6vkyrtb7rrv5pspp9cy8tx7e0hki" as Id<"sitevisits">,
    classification: "productive",
    hostname: "docs.google.com",
    sessions: 1,
    totalDuration: 300,
    userId: "clerk:user_2vhLHFwbblBU9J4M5qWkEKQKcFK", //fake use
    visits: 1,
    _creationTime: 1744592598694.1118,
  },
  {
    _id: "j97d6vkyrtb7rrv5pspp9cy8tx7e0hkj" as Id<"sitevisits">,
    classification: "unproductive",
    hostname: "youtube.com",
    sessions: 1,
    totalDuration: 500,
    userId: "clerk:user_2vhLHFwbblBU9J4M5qWkEKQKcFK", //fake use
    visits: 1,
    _creationTime: 1744592598694.1118,
  },
];

interface SiteListProps {
  user?: User;
}


const SiteList: React.FC = ({ user }: SiteListProps) => {
  const [websites, setWebsites] = useState<Sitevisit[]>(initialWebsites);
  const [newWebsite, setNewWebsite] = useState('');
  const [category, setCategory] = useState<'productive' | 'unproductive' | 'neutral'>('neutral');
  const [filter, setFilter] = useState<'all' | 'productive' | 'unproductive' | 'neutral'>('all');


  const [pageViews, setPageViews] = React.useState({});
  const [sessionData, setSessionData] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(true);


  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (event:any) => {
      if (event.data?.from === "extension") {
        console.log("Received data from extension:", event.data.data);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);
  
  // this sends a message to the extension
  // window.postMessage({ from: "page", action: "sendToExtension", payload: { foo: "bar" } }, "*");
  

  // Move useQuery to the top level of the component
  const userId = user ? `clerk:${user.id}` : undefined;
  const sitevisits = useQuery(api.sitevisits.getSiteVisits, { userId: userId || "" });

  // Update websites state when sitevisits data changes
  useEffect(() => {
    if (sitevisits && sitevisits.length > 0) {
      setWebsites(sitevisits);
    }
  }, [sitevisits]);

  const handleAddWebsite = () => {
    if (newWebsite.trim() === '') return;
    // const websiteExists = websites.some(site => site.name === newWebsite.trim());
    // if (websiteExists) return;
    // const newSite: Website = {
    //   id: Math.max(0, ...websites.map(w => w.id)) + 1,
    //   name: newWebsite.trim(),
    //   category,
    //   timeSpent: 0
    // };
    // setWebsites([...websites, newSite]);
    setNewWebsite('');
  };

  const handleRemoveWebsite = (id: Id<"sitevisits">) => {
    setWebsites(websites.filter(site => site._id !== id));
  };

  const handleCategoryChange = (id: Id<"sitevisits">, newClassification: 'productive' | 'unproductive' | 'neutral') => {
    setWebsites(websites.map(site =>
      site._id === id ? { ...site, classification: newClassification } : site
    ));
    // TODO: update the category in the database
  };

  const filteredWebsites = filter === 'all'
    ? websites
    : websites.filter(site => site.classification === filter);

  function formatSecondsToTime(seconds: number): string {
    const totalMinutes = Math.ceil(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours === 0) parts.push(`${minutes}m`);

    return parts.join(' ');
  }


  // const addSitevisit = useMutation(api.sitevisits.addSiteVisit);
  //   const incrementVisits = useMutation(api.sitevisits.incrementVisits);

  //   const handleAddSitevisit = useCallback(async () => {
  //     if (!newHostname.trim()) return;

  //     try {
  //       await addSitevisit({ userId, hostname: newHostname.trim(),classification:"Productive" });
  //       setNewHostname("");
  //     } catch (err) {
  //       console.error("Error adding website:", err);
  //     }
  //   }, [userId, newHostname, addSitevisit]);

  // //   TURN INTO HANDLE DELETE
  //   const handleIncrementVisits = useCallback(async (sitevisitId: Id<"sitevisits">) => {
  //     try {
  //       await incrementVisits({ sitevisitId });
  //     } catch (err) {
  //       console.error("Error incrementing visits:", err);
  //     }
  //   }, [incrementVisits]);

  return (
    <Card className="pixel-container">
      <CardHeader>
        <CardTitle>Website Tracker</CardTitle>
        <CardDescription>
          Categorize websites and track time spent on them
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Enter website URL (e.g., example.com)"
              value={newWebsite}
              onChange={(e) => setNewWebsite(e.target.value)}
              className="w-full"
            />
          </div>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as 'productive' | 'unproductive' | 'neutral')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="productive">Productive</SelectItem>
                <SelectItem value="unproductive">Unproductive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button onClick={handleAddWebsite} className="px-3" variant="default">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4">
          <Label>Filter:</Label>
          <div className="flex gap-2 mt-1">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filter === 'productive' ? 'default' : 'outline'}
              onClick={() => setFilter('productive')}
              size="sm"
              className="bg-pixel-accent border-black"
            >
              Productive
            </Button>
            <Button
              variant={filter === 'unproductive' ? 'default' : 'outline'}
              onClick={() => setFilter('unproductive')}
              size="sm"
              className="bg-pixel-danger border-black"
            >
              Unproductive
            </Button>
            <Button
              variant={filter === 'neutral' ? 'default' : 'outline'}
              onClick={() => setFilter('neutral')}
              size="sm"
              className="bg-pixel-warning border-black"
            >
              Neutral
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {filteredWebsites.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No websites in this category
            </div>
          ) : (
            filteredWebsites.map((website) => (
              <div
                key={website._id}
                className="flex items-center justify-between p-3 border-2 border-black"
                style={{
                  backgroundColor:
                    website.classification === 'productive' ? 'rgba(16, 185, 129, 0.1)' :
                      website.classification === 'unproductive' ? 'rgba(239, 68, 68, 0.1)' :
                        'rgba(245, 158, 11, 0.1)'
                }}
              >
                <div className="flex-1">
                  <div className="font-medium">{website.hostname}</div>
                  <div className="text-xs text-muted-foreground">
                    Time spent: {formatSecondsToTime(website.totalDuration)}, Visits: {website.visits}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={website.classification}
                    onValueChange={(value) => handleCategoryChange(
                      website._id,
                      value as 'productive' | 'unproductive' | 'neutral'
                    )}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="productive">Productive</SelectItem>
                      <SelectItem value="unproductive">Unproductive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRemoveWebsite(website._id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Click on a category to change it or remove a website
      </CardFooter>
    </Card>
  );
};

export default SiteList;
