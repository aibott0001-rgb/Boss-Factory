"use client";
import { useState, useEffect } from 'react';

export default function NeuralInput() {
  const [input, setInput] = useState('');
  const [detectedLinks, setDetectedLinks] = useState<string[]>([]);

  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = input.match(urlRegex);
    setDetectedLinks(matches || []);
  }, [input]); // Fixed: Proper dependency array

  return <div>Neural Input Component</div>;
}
