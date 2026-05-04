// Inside your component
const [user, setUser] = useState<any>(null);

// Add this useEffect to get user on load
useEffect(() => {
  const getUser = async () => {
    const {  { user } } = await supabase.auth.getUser();
    setUser(user);
  };
  getUser();
}, []);

// Update your analyze function
const handleAnalyze = async () => {
  if (!ideaText) return;
  setIsAnalyzing(true);
  
  try {
    const res = await fetch('/api/analyze-idea', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        idea: ideaText, 
        userId: user?.id 
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error || "Analysis failed");
    
    // Update UI with results
    setAnalysisResult(data.analysis);
    setMessage("✅ Idea analyzed successfully!");
    
  } catch (err: any) {
    setMessage(`❌ Error: ${err.message}`);
  } finally {
    setIsAnalyzing(false);
  }
};
