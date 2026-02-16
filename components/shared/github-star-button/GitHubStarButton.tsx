"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface GitHubStarButtonProps {
  owner: string;
  repo: string;
  className?: string;
  variant?: "default" | "compact";
}

export function GitHubStarButton({ 
  owner, 
  repo, 
  className,
  variant = "default" 
}: GitHubStarButtonProps) {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Check cache first
        const cacheKey = `github-stars-${owner}-${repo}`;
        const cached = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(`${cacheKey}-time`);
        
        if (cached && cacheTime) {
          const cacheAge = Date.now() - parseInt(cacheTime);
          // Use cache if it's less than 5 minutes old
          if (cacheAge < 300000) {
            setStars(parseInt(cached));
            setLoading(false);
            return;
          }
        }

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        const starCount = data.stargazers_count;
        
        setStars(starCount);
        localStorage.setItem(cacheKey, starCount.toString());
        localStorage.setItem(`${cacheKey}-time`, Date.now().toString());
      } catch (err) {
        console.error('Failed to fetch GitHub stars:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
  }, [owner, repo]);

  const formatStars = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const repoUrl = `https://github.com/${owner}/${repo}`;

  if (variant === "compact") {
    return (
      <a
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 text-sm",
          "bg-black-alpha-4 hover:bg-black-alpha-6 rounded-6",
          "transition-all duration-200",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Star 
          className="w-4 h-4 text-heat-100" 
          fill="currentColor"
        />
        <span className="text-label-large">
          {loading ? "..." : error ? "★" : formatStars(stars!)}
        </span>
      </a>
    );
  }

  return (
    <motion.a
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2",
        "bg-heat-100 hover:bg-heat-200 text-white",
        "rounded-8 font-medium text-body-medium",
        "transition-all duration-200",
        "shadow-md hover:shadow-lg",
        "active:scale-[0.98]",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        animate={{
          rotate: isHovered ? [0, -15, 15, 0] : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        <Star className="w-5 h-5" fill="currentColor" />
      </motion.div>
      
      <span>Star</span>
      
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-8 h-5 bg-white/20 rounded animate-pulse"
          />
        ) : error ? (
          <motion.span
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm"
          >
            ★
          </motion.span>
        ) : (
          <motion.span
            key={stars}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm bg-white/20 px-2 py-0.5 rounded min-w-[2rem] text-center"
          >
            {formatStars(stars!)}
          </motion.span>
        )}
      </AnimatePresence>
      
      <ExternalLink className="w-4 h-4 opacity-70" />
    </motion.a>
  );
}
