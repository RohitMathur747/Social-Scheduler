import { useState, useEffect } from "react";
import { dummyGenerationData, PLATFORMS } from "../assets/assets";
import {
  ArrowRightIcon,
  HistoryIcon,
  Loader2Icon,
  Wand2Icon,
  XIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const AIComposer = () => {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [generateImage, setGenereateImage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState<any[]>([]);

  //scheduling state
  const [activeScheduler, setActiveScheduler] = useState<any>(null);
  const [selectedPaltforms, setSelectedPaltforms] = useState<any[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduling, setScheduling] = useState("");

  const handleCancelSchedule = () => {
    setActiveScheduler(null);
    setSelectedPaltforms([]);
    setScheduledDate("");
    setScheduledTime("");
  };

  const fetchGenerations = async () => {
    try {
      const { data } = await api.get("api/posts/generations");
      setGenerations(data.generations);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, []);

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please Enter a Prompt");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/posts/generate", {
        prompt,
        tone,
        generateImage,
      });
      const newGeneration = data.generation;
      setGenerations([newGeneration, ...generations]);
      setActiveScheduler(newGeneration);
      toast.success("Content Generated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!activeScheduler) return;
    if (selectedPaltforms.length === 0) {
      toast.error("Select at least one Platform");
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error("select date and Time");
      return;
    }
    const scheduledFor = new Date(
      `${scheduledDate}T${scheduledTime}`,
    ).toISOString();
    setScheduling(true);
    try {
      await api.post("/api/posts", {
        content: activeScheduler.content,
        mediaUrl: activeScheduler.mediaUrl,
        mediaType: activeScheduler.mediaType,
        platforms: selectedPaltforms,
        scheduledFor,
        status: "scheduled",
      });
      toast.success("AI Post Scheduled!");
      setActiveScheduler(null);
      setSelectedPaltforms([]);
      setScheduledDate("");
      setScheduledTime("");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to schedule",
      );
    } finally {
      setScheduling(false);
    }
  };

  const tones = ["Professional", "Creative", "Funny", "Minimalist", "Exicted"];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Input Section */}
      <div className="space-y-6 text-center mt-20">
        <h1 className="text-3xl text-slate-700 tracking-tight">
          What Should We Create Today?
        </h1>
        <div className="relative group mt-12">
          <textarea
            className="w-full px-6 py-6 bg-white border border-slate-300 rounded-xl 
            text-slate-900 placeholder-slate-400 outline-none focus:border-slate-400
             transition resize-none h-40"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Share your idea...(e.g Apost about the launch of new eco-friendly coffee beans"
          />
          <div className="absolute bottom-4 right-2.5 flex items-center gap-3 text-sm">
            <button
              onClick={() => setGenereateImage(!generateImage)}
              className="flex items-center gap-3 bg-red-50 py-2 px-3 rounded-lg"
            >
              <span>AI Image</span>
              <div
                className={`realtive inline-flex h-5 w-9 shrink-0 cursor-pointer
                rounded-full transition-colors duration-200 ease-in-out focus:outline-none
                ${generateImage ? "bg-red-500" : "bg-slate-200"}`}
              >
                <span
                  className={`pointer-events-none size-4 transform translate-y-0.5 rounded-full bg-white transition
                   ${generateImage ? "translate-x-4.5" : "translate-x-0.5"}`}
                />
              </div>
            </button>
            <button
              disabled={loading}
              onClick={handleGenerate}
              className="bg-slate-900 hover:bg-slate-800 text-white flex 
              items-center gap-2 px-4 py-2 rounded-lg"
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  Generate
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {tones.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all border ${tone === t ? "bg-red-500 border-red-500 text-white" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Ai Generated Posts*/}
      <div className="space-y-6 pt-12 border-t border-slate-100">
        <div className="flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-2">
            <HistoryIcon className="size-5" />
            <h3 className="text-xl">Recent Generations</h3>
          </div>
          <span className="text-sm text-slate-500 bg-slate-50 px-2">
            {generations.length} Total
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {generations.map((gen) => (
            <div
              key={gen._id}
              className="group bg-white rounded-2xl border
             border-slate-100 hover:border-red-200 transition-all relative overflow-hidden"
            >
              <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase tracking-widest">
                    {new Date(gen.createdAt).toLocaleString()}
                  </span>
                  <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                    {gen.tone}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
                  {gen.content}
                </p>
                {gen.mediaUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={gen.mediaUrl}
                      alt="Gen"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                <div className="mt-auto pt-2">
                  <button
                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
                    onClick={() => setActiveScheduler(gen)}
                  >
                    Schedule Post
                  </button>
                </div>
              </div>
            </div>
          ))}
          {generations.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="size-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Wand2Icon className="size-6 text-red-400" />
              </div>
              <p className="text-slate-500 max-w-xs">
                No Content Generated yet. Try generating some content using AI
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scheduler Modal */}
      {activeScheduler && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">
                Schedule Generation
              </h3>
              <button
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setActiveScheduler(null)}
              >
                <XIcon className="size-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4 border-b border-slate-50">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  Prompt
                </p>
                <p className="text-sm text-slate-600">
                  {activeScheduler.prompt}
                </p>
              </div>
            </div>

            <div className="p-4 border-b border-slate-50">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  Content
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {activeScheduler.content}
                </p>
              </div>
            </div>
            {activeScheduler.mediaUrl && (
              <div className="px-4 pb-4">
                <img
                  src={activeScheduler.mediaUrl}
                  alt="preview"
                  className="w-full max-h-40 object-cover rounded-lg"
                />
              </div>
            )}
            {/* Schedule Options */}
            <div className="p-4 border-t border-slate-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Select Channels
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => {
                    const active = selectedPaltforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() =>
                          setSelectedPaltforms((prev) =>
                            prev.includes(p.id)
                              ? prev.filter((x) => x !== p.id)
                              : [...prev, p.id],
                          )
                        }
                        className={`p-2.5 rounded-lg border transition-all ${
                          active
                            ? "bg-red-500/80 text-white border-red-500/80"
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        <p.icon className="size-4.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-slate-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-slate-400 transition"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelSchedule}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scheduling ? "Scheduling..." : "Schedule Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIComposer;
