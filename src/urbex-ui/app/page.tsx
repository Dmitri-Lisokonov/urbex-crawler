'use client';

import { useState, useEffect } from 'react';
import { FaBug } from 'react-icons/fa';
import { IoFilterSharp } from "react-icons/io5";
import { FiAlertCircle } from 'react-icons/fi';

const loadingPhrases = [
  'Scanning the shadows...',
  'Finding hidden relics...',
  'Navigating forbidden paths...',
  'Looking for lost places...',
  'Digging through the dark...'
];

const FILTER_CATEGORIES = [
  {
    name: "historic",
    tags: [
      { key: "ruins", displayName: "Ruins" },
      { key: "castle", displayName: "Castle" },
      { key: "archaeological_site", displayName: "Archaeological Site" },
      { key: "fort", displayName: "Fort" }
    ]
  },
  {
    name: "abandoned",
    tags: [
      { key: "yes", displayName: "Abandoned" }
    ]
  },
  {
    name: "natural",
    tags: [
      { key: "cave_entrance", displayName: "Cave Entrance" },
      { key: "spring", displayName: "Spring" },
      { key: "rock", displayName: "Rock" },
      { key: "cliff", displayName: "Cliff" },
      { key: "sinkhole", displayName: "Sinkhole" },
      { key: "wood", displayName: "Wood" }
    ]
  },
  {
    name: "landuse",
    tags: [
      { key: "forest", displayName: "Forest" }
    ]
  },
  {
    name: "tourism",
    tags: [
      { key: "viewpoint", displayName: "Viewpoint" },
      { key: "wilderness_hut", displayName: "Wilderness Hut" },
      { key: "alpine_hut", displayName: "Alpine Hut" }
    ]
  },
  {
    name: "man_made",
    tags: [
      { key: "bunker", displayName: "Bunker" },
      { key: "tower", displayName: "Observation Tower" }
    ]
  },
  {
    name: "leisure",
    tags: [
      { key: "picnic_site", displayName: "Picnic Site" }
    ]
  },
  {
    name: "highway",
    tags: [
      { key: "trailhead", displayName: "Trailhead" },
      { key: "path", displayName: "Mountain Hiking Path" }
    ]
  }
];


export default function Home() {
  const url = 'https://urbexcrawler.codesty.dev/location/random';
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [animatedKey, setAnimatedKey] = useState(0);
  const [radius, setRadius] = useState(50);
  const [radiusChanged, setRadiusChanged] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const [footerAnimation, setFooterAnimation] = useState<'up' | 'down' | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Record<string, Set<string>>>(() => {
    const defaultState: Record<string, Set<string>> = {};
    FILTER_CATEGORIES.forEach(cat => {
      defaultState[cat.name] = new Set(cat.tags.map(tag => tag.key));
    });
    return defaultState;
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setNotificationVisible(true);
    setTimeout(() => {
      setNotificationVisible(false); // triggers fade-out
      setTimeout(() => setNotification(null), 300); // unmount after animation ends
    }, 4000);
  };

  const mainText = loading ? loadingPhrases[phraseIndex] : 'Explore the obscure';
  const subText = loading ? 'Please wait while we search...' : 'One click. One place.';

  useEffect(() => {
    setVisible(true);
    setTimeout(() => setNavVisible(true), 100); // small delay makes it more natural
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      setAnimatedKey((k) => k + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleRandomClick = async () => {
    setLoading(true);
    setAnimatedKey((k) => k + 1);
    try {
      const tagToPropertyMap: Record<string, string> = {
        ruins: "Ruins",
        castle: "Castle",
        archaeological_site: "ArchaeologicalSite",
        fort: "Fort",
        yes: "Abandoned",
        cave_entrance: "CaveEntrance",
        spring: "Spring",
        rock: "Rock",
        cliff: "Cliff",
        sinkhole: "Sinkhole",
        wood: "Wood",
        forest: "Forest",
        viewpoint: "Viewpoint",
        wilderness_hut: "WildernessHut",
        alpine_hut: "AlpineHut",
        bunker: "Bunker",
        tower: "Tower",
        picnic_site: "PicnicSite",
        trailhead: "Trailhead",
        path: "Path",
      };

      const payload: Record<string, boolean | number> = {
        RadiusMeters: radius * 1000,
      };

      for (const [category, tagSet] of Object.entries(selectedTags)) {
        for (const tag of tagSet) {
          const prop = tagToPropertyMap[tag];
          if (prop) {
            payload[prop] = true;
          }
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to fetch location');
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else setNotification('No URL received from server');
    } catch (err) {
      console.error(err);
      showNotification('Something went wrong. Check the API status.');
      setNotificationVisible(true);
      setTimeout(() => {
        setNotificationVisible(false);
        setTimeout(() => setNotification(null), 300); // wait for fade-out before unmount
      }, 4000);
    } finally {
      setLoading(false);
      setPhraseIndex(0);
      setTimeout(() => setNotification(null), 4000);
    }
  };



  return (
    <>
      {notification && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl px-4">
          <div
            className={`w-full border border-white bg-black/10 backdrop-blur-md px-6 py-3 text-white text-sm font-mono uppercase tracking-wide shadow-lg flex items-center gap-3 ${notificationVisible ? 'animate-fade-slide-in' : 'animate-fade-slide-out'
              }`}
          >
            <FiAlertCircle className="text-lg text-white/80" />
            <span>{notification}</span>
          </div>
        </div>
      )}


      <nav className="w-full fixed top-0 left-0 z-50 bg-black/10 backdrop-blur-md border-b border-white px-6 py-4 uppercase tracking-wide text-sm font-mono">
        <div className="flex justify-center items-center gap-3 text-white font-bold">
          <FaBug className="text-xl" />
          Urbex Crawler
        </div>
      </nav>

      <div
        className="flex items-center justify-center min-h-screen px-4 text-white"
        style={{
          backgroundColor: '#1f2937',
          backgroundImage: 'url("/background.png")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className={`transition-all duration-500 ease-in-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
            } -mt-32 border border-white bg-black/10 backdrop-blur-md p-10 w-full max-w-xl uppercase tracking-tight font-mono shadow-lg relative`}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-stretch">
            <div className="flex items-center gap-x-4">
              <FaBug
                className={`text-4xl text-white ${loading ? 'animate-[shake-tiny_0.5s_ease-in-out_infinite]' : ''}`}
                style={{ position: 'relative' }}
              />
              <div className="min-h-[4.5rem] flex flex-col justify-center">
                {radiusChanged ? (
                  <>
                    <p
                      key={`main-${animatedKey}`}
                      className="text-4xl sm:text-5xl font-bold text-white/90 opacity-0 animate-fade-in"
                    >
                      {radius} KM
                    </p>
                    <p
                      key={`sub-${animatedKey}`}
                      className="text-xs text-white/70 opacity-0 animate-fade-in"
                    >
                      Exploration radius
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      key={`main-${animatedKey}`}
                      className="text-lg font-bold transition-opacity duration-700 opacity-0 animate-fade-in"
                    >
                      {mainText}
                    </p>
                    <p
                      key={`sub-${animatedKey}`}
                      className="text-xs text-white/70 transition-opacity duration-700 opacity-0 animate-fade-in"
                    >
                      {subText}
                    </p>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleRandomClick}
              disabled={loading}
              className="w-full border border-white px-4 py-2 text-xs font-bold uppercase hover:bg-white hover:text-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex justify-center items-center gap-x-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z"
                    />
                  </svg>
                  <span>Looking for randomized location...</span>
                </div>
              ) : (
                'Random'
              )}
            </button>
          </div>
        </div>
      </div>
      <footer
        className={`w-full fixed bottom-0 left-0 z-50 border-t border-white bg-black/10 backdrop-blur-md px-6 py-6 transform transition-transform ${footerAnimation === 'up'
          ? 'animate-jump-up'
          : footerAnimation === 'down'
            ? 'animate-jump-down'
            : ''
          }`}
      >
        <div className="max-w-xl mx-auto flex flex-col text-white font-mono w-full gap-4">
          {/* Top row: Label + Filter button */}
          <div className="flex items-center justify-between w-full">
            <label htmlFor="range" className="text-sm uppercase tracking-widest text-white/70">
              Exploration Radius
            </label>
            <button
              type="button"
              className="text-white/70 hover:text-white transition-colors p-2 rounded-full border border-white/30 hover:border-white backdrop-blur"
              aria-label="Filter options"
              onClick={() => {
                if (showFilters) {
                  setFooterAnimation('down');
                  setTimeout(() => {
                    setShowFilters(false);
                    setFooterAnimation(null);
                  }, 400); // matches animation duration
                } else {
                  setShowFilters(true);
                  setFooterAnimation('up');
                }
              }}
            >
              <IoFilterSharp className="w-5 h-5 text-white" />

            </button>
          </div>

          {/* Slider */}
          <input
            id="range"
            type="range"
            min="1"
            max="300"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            onMouseDown={() => {
              setRadiusChanged(true);
              setAnimatedKey((k) => k + 1);
            }}
            onTouchStart={() => {
              setRadiusChanged(true);
              setAnimatedKey((k) => k + 1);
            }}
            onMouseUp={() => {
              setFadingOut(true);
              setTimeout(() => {
                setRadiusChanged(false);
                setFadingOut(false);
                setAnimatedKey((k) => k + 1);
              }, 500);
            }}
            onTouchEnd={() => {
              setFadingOut(true);
              setTimeout(() => {
                setRadiusChanged(false);
                setFadingOut(false);
                setAnimatedKey((k) => k + 1);
              }, 500);
            }}
            className="w-full h-4 bg-gray-800/10 rounded-lg appearance-none cursor-pointer accent-white custom-thumb"
          />

          {/* Expandable Filter Panel */}
          {showFilters && (
            <div className="mt-3 w-full border-t border-white/20 pt-3 flex flex-col gap-3">
              <label className="text-xs uppercase tracking-wide text-white/60">Filter Categories</label>
              {FILTER_CATEGORIES.map((category) => (
                <div key={category.name} className="flex flex-wrap items-center gap-1 mb-1">
                  <span className="text-white/50 font-semibold text-[10px] w-full">{category.name}</span>
                  {category.tags.map((tag) => {
                    const isSelected = selectedTags[category.name]?.has(tag.key);
                    return (
                      <button
                        key={`${category.name}-${tag.key}-${isSelected ? 'on' : 'off'}`}
                        onClick={() => {
                          setSelectedTags(prev => {
                            const currentSet = prev[category.name];
                            const nextSet = new Set(currentSet); // clone to avoid mutation

                            if (currentSet.has(tag.key)) {
                              nextSet.delete(tag.key);
                            } else {
                              nextSet.add(tag.key);
                            }

                            // Fully construct a new object to trigger re-render
                            return {
                              ...prev,
                              [category.name]: nextSet
                            };
                          });
                        }}
                        className={`px-2 py-[0.25rem] border rounded text-[10px] uppercase transition ${isSelected
                          ? 'bg-white text-black border-white'
                          : 'border-white/20 hover:bg-white hover:text-black'
                          }`}
                      >
                        {tag.displayName}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </footer>

      <style jsx global>{`
        @keyframes shake-tiny {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          25% { transform: translate3d(-1px, 0, 0) rotate(-0.5deg); }
          50% { transform: translate3d(1px, 0, 0) rotate(0.5deg); }
          75% { transform: translate3d(-1px, 0, 0) rotate(-0.3deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-in-out forwards;
        }

        input[type='range'].custom-thumb::-moz-range-thumb {
          height: 1.8rem;
          width: 1.8rem;
          background: white;
          border-radius: 50%;
          cursor: pointer;
        }

      input[type='range'].custom-thumb::-moz-range-thumb {
        background: #374151;
        cursor: pointer;
      }

      input[type='range'].custom-thumb {
        background-color: transparent; /* keep transparent to avoid full fill */
      }

      input[type='range'].custom-thumb::-webkit-slider-runnable-track {
        background: #374151; /* Tailwind gray-700 */
      }

      input[type='range'].custom-thumb::-moz-range-track {
        background: #374151; /* Tailwind gray-700 */
      }
      `}</style>
    </>
  );
}

