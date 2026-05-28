import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useBroadcastReceiver } from '@/hooks/useBroadcast';
import type { GraphicsSettings, BroadcastMessage } from '@/types/rally';
import { defaultLayoutForGraphic } from '@/lib/graphicsStyle';
import CrewLowerThird from '@/components/graphics/CrewLowerThird';
import StageLowerThird from '@/components/graphics/StageLowerThird';
import InterviewLowerThird from '@/components/graphics/InterviewLowerThird';
import VsLowerThird from '@/components/graphics/VsLowerThird';
import StageResults from '@/components/graphics/StageResults';
import OverallStandings from '@/components/graphics/OverallStandings';
import HeadToHead from '@/components/graphics/HeadToHead';
import StartList from '@/components/graphics/StartList';
import EntriesList from '@/components/graphics/EntriesList';
import Weather from '@/components/graphics/Weather';
import Scorebug from '@/components/graphics/Scorebug';
import SponsorCrawl from '@/components/graphics/SponsorCrawl';
import CountdownTimer from '@/components/graphics/CountdownTimer';
import Stinger from '@/components/graphics/Stinger';
import StageMap from '@/components/graphics/StageMap';
import ElevationProfile from '@/components/graphics/ElevationProfile';
import RallyIntro from '@/components/graphics/RallyIntro';
import StagePresentation from '@/components/graphics/StagePresentation';
import StageWeather from '@/components/graphics/StageWeather';
import StartGrid from '@/components/graphics/circuit/StartGrid';
import CircuitLiveTiming from '@/components/graphics/circuit/CircuitLiveTiming';
import DriverLapLowerThird from '@/components/graphics/circuit/DriverLapLowerThird';
import RaceFlag from '@/components/graphics/circuit/RaceFlag';
import PitTracker from '@/components/graphics/circuit/PitTracker';
import Podium from '@/components/graphics/circuit/Podium';
import FinalResults from '@/components/graphics/circuit/FinalResults';
import CircuitScorebug from '@/components/graphics/circuit/CircuitScorebug';

const defaultSettings: GraphicsSettings = {
  primaryColor: '#1A1A1E',
  secondaryColor: '#0F0F11',
  accentColor: '#FF6B00',
  textColor: '#E8E8F0',
  shearAngle: 0,
  fontDisplay: 'Barlow Condensed',
  fontSizeScale: 0.95,
  panelOpacity: 0.92,
  cornerStyle: 'sharp',
  animationSpeed: 'fast',
  borderAccent: true,
  lowerThirdLayout: 'horizontal',
  towerWidth: 560,
  displayPageSize: 15,
  displayPageOffset: 0,
  language: 'es',
  customLabels: {},
  routeAnimDuration: 8,
  transforms: {
    crewLowerThird: { x: 0, y: 0, scale: 1 },
    stageLowerThird: { x: 0, y: 0, scale: 1 },
    interviewLowerThird: { x: 0, y: 0, scale: 1 },
    scorebug: { x: 0, y: 0, scale: 1 },
    stageResults: { x: 0, y: 0, scale: 1 },
    overallStandings: { x: 0, y: 0, scale: 1 },
    headToHead: { x: 0, y: 0, scale: 1 },
    startList: { x: 0, y: 0, scale: 1 },
    entriesList: { x: 0, y: 0, scale: 1 },
    stageMap: { x: 0, y: 0, scale: 1 },
    elevationProfile: { x: 0, y: 0, scale: 1 },
    weather: { x: 0, y: 0, scale: 1 },
    sponsorCrawl: { x: 0, y: 0, scale: 1 },
    countdown: { x: 0, y: 0, scale: 1 },
    rallyIntro: { x: 0, y: 0, scale: 1 },
    stagePresentation: { x: 0, y: 0, scale: 1 },
    stageWeather: { x: 0, y: 0, scale: 1 },
    circuitScorebug: { x: 0, y: 0, scale: 1 },
    startGrid: { x: 0, y: 0, scale: 1 },
    circuitTiming: { x: 0, y: 0, scale: 1 },
    driverLap: { x: 0, y: 0, scale: 1 },
    raceFlag: { x: 0, y: 0, scale: 1 },
    pitTracker: { x: 0, y: 0, scale: 1 },
    podium: { x: 0, y: 0, scale: 1 },
    finalResults: { x: 0, y: 0, scale: 1 },
  },
  layouts: {},
};

const Output = () => {
  const [activeGraphics, setActiveGraphics] = useState<Record<string, Record<string, unknown>>>({});
  const [settings, setSettings] = useState<GraphicsSettings>(defaultSettings);
  const [scale, setScale] = useState(1);
  const [showStinger, setShowStinger] = useState(false);

  const room = new URLSearchParams(window.location.search).get('room');

  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / 1920;
      const scaleY = window.innerHeight / 1080;
      setScale(Math.min(scaleX, scaleY));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    document.title = 'Feed+ Motorsport — Output  |  by Studio+';
    document.body.style.background = 'transparent';
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useBroadcastReceiver(useCallback((msg: BroadcastMessage) => {
    if (msg.type === 'TAKE' && msg.graphic) {
      if (msg.graphic === 'stinger') {
        setShowStinger(true);
        setTimeout(() => setShowStinger(false), 900);
      } else {
        setActiveGraphics(prev => ({ ...prev, [msg.graphic!]: msg.data }));
      }
    } else if (msg.type === 'CLEAR' && msg.graphic) {
      setActiveGraphics(prev => {
        const next = { ...prev };
        delete next[msg.graphic!];
        return next;
      });
    } else if (msg.type === 'UPDATE_SETTINGS' && msg.settings) {
      setSettings(prev => ({ ...prev, ...msg.settings }));
    } else if (msg.type === 'UPDATE_LAYOUT' && msg.layout) {
      const { graphic, patch } = msg.layout;
      setSettings(prev => {
        const current = prev.layouts?.[graphic] ?? defaultLayoutForGraphic(graphic);
        const layouts = { ...prev.layouts, [graphic]: { ...current, ...patch } };
        return { ...prev, layouts };
      });
    } else if (msg.type === 'PAGE_CHANGE' && msg.pageOffset !== undefined) {
      setSettings(prev => ({ ...prev, displayPageOffset: msg.pageOffset! }));
    }
  }, []), room);

  return (
    <div style={{
      width: '1920px',
      height: '1080px',
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <AnimatePresence mode="wait">
        {activeGraphics.scorebug && <Scorebug key="scorebug" data={activeGraphics.scorebug} settings={settings} />}
        {activeGraphics.crewLowerThird && <CrewLowerThird key="crew" data={activeGraphics.crewLowerThird} settings={settings} />}
        {activeGraphics.stageLowerThird && <StageLowerThird key="stage" data={activeGraphics.stageLowerThird} settings={settings} />}
        {activeGraphics.interviewLowerThird && <InterviewLowerThird key="interview" data={activeGraphics.interviewLowerThird} settings={settings} />}
        {activeGraphics.vsLowerThird && <VsLowerThird key="vs" left={activeGraphics.vsLowerThird.left} right={activeGraphics.vsLowerThird.right} settings={settings} />}
        {activeGraphics.stageResults && <StageResults key="stageResults" data={activeGraphics.stageResults} settings={settings} />}
        {activeGraphics.overallStandings && <OverallStandings key="overall" data={activeGraphics.overallStandings} settings={settings} />}
        {activeGraphics.headToHead && <HeadToHead key="h2h" data={activeGraphics.headToHead} settings={settings} />}
        {activeGraphics.startList && <StartList key="startList" data={activeGraphics.startList} settings={settings} />}
        {activeGraphics.entriesList && <EntriesList key="entriesList" data={activeGraphics.entriesList} settings={settings} />}
        {activeGraphics.weather && <Weather key="weather" data={activeGraphics.weather} settings={settings} />}
        {activeGraphics.sponsorCrawl && <SponsorCrawl key="sponsors" data={activeGraphics.sponsorCrawl} settings={settings} />}
        {activeGraphics.countdown && <CountdownTimer key="countdown" data={activeGraphics.countdown} settings={settings} />}
        {activeGraphics.stageMap && <StageMap key="map" settings={settings} data={activeGraphics.stageMap} />}
        {activeGraphics.elevationProfile && <ElevationProfile key="elevation" settings={settings} data={activeGraphics.elevationProfile} />}
        {activeGraphics.rallyIntro && <RallyIntro key="rallyIntro" data={activeGraphics.rallyIntro} settings={settings} />}
        {activeGraphics.stagePresentation && <StagePresentation key="stagePresentation" data={activeGraphics.stagePresentation} settings={settings} />}
        {activeGraphics.stageWeather && <StageWeather key="stageWeather" data={activeGraphics.stageWeather} settings={settings} />}

        {activeGraphics.circuitScorebug && <CircuitScorebug key="cScorebug" data={activeGraphics.circuitScorebug} settings={settings} />}
        {activeGraphics.startGrid && <StartGrid key="startGrid" data={activeGraphics.startGrid} settings={settings} />}
        {activeGraphics.circuitTiming && (
          <CircuitLiveTiming
            key="circuitTiming"
            data={activeGraphics.circuitTiming.rows ?? activeGraphics.circuitTiming}
            currentLap={activeGraphics.circuitTiming?.currentLap}
            totalLaps={activeGraphics.circuitTiming?.totalLaps}
            columns={activeGraphics.circuitTiming?.columns}
            settings={settings}
          />
        )}
        {activeGraphics.driverLap && <DriverLapLowerThird key="driverLap" data={activeGraphics.driverLap} settings={settings} />}
        {activeGraphics.raceFlag && <RaceFlag key="raceFlag" data={activeGraphics.raceFlag} settings={settings} />}
        {activeGraphics.pitTracker && <PitTracker key="pitTracker" data={activeGraphics.pitTracker} settings={settings} />}
        {activeGraphics.podium && <Podium key="podium" data={activeGraphics.podium} settings={settings} />}
        {activeGraphics.finalResults && <FinalResults key="finalResults" data={activeGraphics.finalResults} settings={settings} />}

        {showStinger && <Stinger key="stinger" settings={settings} />}
      </AnimatePresence>
    </div>
  );
};

export default Output;
