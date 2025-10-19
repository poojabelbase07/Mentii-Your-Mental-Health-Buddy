import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/3D/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";

const memeBgOptions = [
  "https://placehold.co/600x400/22b864/ffffff?text=Custom+Meme+Template+1",
  "https://placehold.co/600x400/0d87de/ffffff?text=Custom+Meme+Template+2",
  "https://placehold.co/600x400/8662f0/ffffff?text=Custom+Meme+Template+3",
  "https://placehold.co/600x400/f57219/ffffff?text=Custom+Meme+Template+4",
  "https://placehold.co/600x400/e64980/ffffff?text=Custom+Meme+Template+5",
];

const MemeGenerator = () => {
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [selectedBg, setSelectedBg] = useState(memeBgOptions[0]);
  const [savedMemes, setSavedMemes] = useState([]);

  const handleBgChange = () => {
    const currentIndex = memeBgOptions.indexOf(selectedBg);
    const nextIndex = (currentIndex + 1) % memeBgOptions.length;
    setSelectedBg(memeBgOptions[nextIndex]);
  };

  const handleSaveMeme = () => {
    const newMeme = {
      id: Date.now(),
      top: topText,
      bottom: bottomText,
      bg: selectedBg
    };
    setSavedMemes([...savedMemes, newMeme]);
    toast.success("Meme saved! Check your collection.");
  };

  const handleShare = () => {
    toast.success("Sharing feature coming soon!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meme Generator</CardTitle>
          <CardDescription>
            Create your own custom memes to boost your mood
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="topText" className="text-sm font-medium">
                  Top Text
                </label>
                <Input
                  id="topText"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="Enter top text"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="bottomText" className="text-sm font-medium">
                  Bottom Text
                </label>
                <Input
                  id="bottomText"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="Enter bottom text"
                />
              </div>
              <Button onClick={handleBgChange} variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Change Background
              </Button>
              <div className="flex gap-2">
                <Button onClick={handleSaveMeme} className="flex-1">
                  Save Meme
                </Button>
                <Button onClick={handleShare} variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="relative rounded-lg overflow-hidden aspect-video bg-muted">
              <img 
                src={selectedBg} 
                alt="Meme background" 
                className="w-full h-full object-cover"
              />
              {topText && (
                <div className="absolute top-4 left-0 right-0 text-center">
                  <p className="text-2xl font-bold text-white uppercase text-shadow-lg">
                    {topText}
                  </p>
                </div>
              )}
              {bottomText && (
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-2xl font-bold text-white uppercase text-shadow-lg">
                    {bottomText}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {savedMemes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Meme Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {savedMemes.map((meme) => (
                <div key={meme.id} className="relative rounded-lg overflow-hidden aspect-video group">
                  <img 
                    src={meme.bg} 
                    alt="Saved meme" 
                    className="w-full h-full object-cover"
                  />
                  {meme.top && (
                    <div className="absolute top-2 left-0 right-0 text-center">
                      <p className="text-lg font-bold text-white uppercase text-shadow-lg">
                        {meme.top}
                      </p>
                    </div>
                  )}
                  {meme.bottom && (
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                      <p className="text-lg font-bold text-white uppercase text-shadow-lg">
                        {meme.bottom}
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="ghost" size="icon" className="text-white">
                      <Download className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MemeGenerator;
