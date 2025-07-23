import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, Timer, Heart, Moon, Waves, TreePine, Cloud, Wind, Flame, Bird, Zap, BookOpen, Sparkles, Layers } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Slider } from './components/ui/slider'
import { Badge } from './components/ui/badge'

interface AudioTrack {
  id: string
  name: string
  category: 'nature' | 'frequencies' | 'stories'
  icon: React.ReactNode
  url: string
  duration?: string
  isPlaying: boolean
  volume: number
}

function App() {
  const [activeTab, setActiveTab] = useState<'nature' | 'frequencies' | 'stories'>('nature')
  const [sleepTimer, setSleepTimer] = useState(0) // в минутах
  const [timerActive, setTimerActive] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [mixMode, setMixMode] = useState(false) // режим смешивания звуков
  const [activePreset, setActivePreset] = useState<string | null>(null)
  
  // Предустановленные комбинации звуков
  const presets = [
    {
      id: 'forest_rain',
      name: 'Дождь в лесу',
      description: 'Дождь + лесные звуки + пение птиц',
      tracks: ['rain', 'forest', 'birds'],
      volumes: { rain: 70, forest: 50, birds: 30 }
    },
    {
      id: 'ocean_meditation',
      name: 'Океанская медитация',
      description: 'Океан + альфа волны',
      tracks: ['ocean', 'alpha'],
      volumes: { ocean: 60, alpha: 40 }
    },
    {
      id: 'nature_mix',
      name: 'Природный микс',
      description: 'Ветер + огонь + птицы',
      tracks: ['wind', 'fire', 'birds'],
      volumes: { wind: 45, fire: 65, birds: 35 }
    },
    {
      id: 'relaxation',
      name: 'Глубокое расслабление',
      description: 'Тета волны + сказка',
      tracks: ['theta', 'story1'],
      volumes: { theta: 45, story1: 70 }
    }
  ]
  




  const [tracks, setTracks] = useState<AudioTrack[]>([
    // Звуки природы - простые демо-звуки
    {
      id: 'rain',
      name: 'Дождь в лесу',
      category: 'nature',
      icon: <Cloud className="w-5 h-5" />,
      url: '', // Будет заполнено позже
      duration: '∞',
      isPlaying: false,
      volume: 70
    },
    {
      id: 'ocean',
      name: 'Океанские волны',
      category: 'nature',
      icon: <Waves className="w-5 h-5" />,
      url: '',
      duration: '∞',
      isPlaying: false,
      volume: 70
    },
    {
      id: 'forest',
      name: 'Лесные звуки',
      category: 'nature',
      icon: <TreePine className="w-5 h-5" />,
      url: '',
      duration: '∞',
      isPlaying: false,
      volume: 70
    },
    {
      id: 'wind',
      name: 'Шум ветра',
      category: 'nature',
      icon: <Wind className="w-5 h-5" />,
      url: '',
      duration: '∞',
      isPlaying: false,
      volume: 60
    },
    {
      id: 'fire',
      name: 'Треск костра',
      category: 'nature',
      icon: <Flame className="w-5 h-5" />,
      url: '',
      duration: '∞',
      isPlaying: false,
      volume: 65
    },
    {
      id: 'birds',
      name: 'Пение птиц',
      category: 'nature',
      icon: <Bird className="w-5 h-5" />,
      url: '',
      duration: '∞',
      isPlaying: false,
      volume: 55
    },
    // Частоты - простые тоны
    {
      id: 'alpha',
      name: 'Альфа волны (8-12 Гц)',
      category: 'frequencies',
      icon: <Waves className="w-5 h-5" />,
      url: '',
      duration: '60 мин',
      isPlaying: false,
      volume: 50
    },
    {
      id: 'theta',
      name: 'Тета волны (4-8 Гц)',
      category: 'frequencies',
      icon: <Waves className="w-5 h-5" />,
      url: '',
      duration: '60 мин',
      isPlaying: false,
      volume: 50
    },
    // Сказки - простые тоны
    {
      id: 'story1',
      name: 'Сказка о звёздном небе',
      category: 'stories',
      icon: <Moon className="w-5 h-5" />,
      url: '',
      duration: '15 мин',
      isPlaying: false,
      volume: 80
    },
    {
      id: 'meditation',
      name: 'Медитация перед сном',
      category: 'stories',
      icon: <Sparkles className="w-5 h-5" />,
      url: '',
      duration: '20 мин',
      isPlaying: false,
      volume: 75
    }
  ])

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  // Инициализация аудио URL при загрузке компонента
  useEffect(() => {
    // Простая функция для конвертации AudioBuffer в WAV
    const audioBufferToWav = (buffer: AudioBuffer) => {
      const length = buffer.length
      const arrayBuffer = new ArrayBuffer(44 + length * 2)
      const view = new DataView(arrayBuffer)
      const data = buffer.getChannelData(0)
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i))
        }
      }
      
      writeString(0, 'RIFF')
      view.setUint32(4, 36 + length * 2, true)
      writeString(8, 'WAVE')
      writeString(12, 'fmt ')
      view.setUint32(16, 16, true)
      view.setUint16(20, 1, true)
      view.setUint16(22, 1, true)
      view.setUint32(24, buffer.sampleRate, true)
      view.setUint32(28, buffer.sampleRate * 2, true)
      view.setUint16(32, 2, true)
      view.setUint16(34, 16, true)
      writeString(36, 'data')
      view.setUint32(40, length * 2, true)
      
      // Convert float samples to 16-bit PCM
      let offset = 44
      for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, data[i]))
        view.setInt16(offset, sample * 0x7FFF, true)
        offset += 2
      }
      
      return arrayBuffer
    }

    // Создание простых звуков с помощью Web Audio API
    const createAudioBuffer = (frequency: number, duration: number = 2) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const sampleRate = audioContext.sampleRate
      const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
      const data = buffer.getChannelData(0)
      
      for (let i = 0; i < data.length; i++) {
        // Создаём простой синусоидальный тон с небольшим шумом для имитации природных звуков
        const t = i / sampleRate
        data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.1 + (Math.random() - 0.5) * 0.05
      }
      
      // Конвертируем в WAV и возвращаем data URL
      const wav = audioBufferToWav(buffer)
      const blob = new Blob([wav], { type: 'audio/wav' })
      return URL.createObjectURL(blob)
    }

    const initializeAudio = () => {
      setTracks(prev => prev.map(track => {
        let frequency = 440 // Базовая частота
        
        // Разные частоты для разных звуков
        switch (track.id) {
          case 'rain': frequency = 200; break
          case 'ocean': frequency = 150; break
          case 'forest': frequency = 300; break
          case 'wind': frequency = 100; break
          case 'fire': frequency = 250; break
          case 'birds': frequency = 800; break
          case 'alpha': frequency = 10; break
          case 'theta': frequency = 6; break
          case 'story1': frequency = 440; break
          case 'meditation': frequency = 528; break
        }
        
        return {
          ...track,
          url: createAudioBuffer(frequency, 3)
        }
      }))
    }

    // Небольшая задержка для инициализации
    setTimeout(initializeAudio, 100)
  }, [])

  const togglePlay = (trackId: string) => {
    const currentTrack = tracks.find(t => t.id === trackId)
    if (!currentTrack) return

    // Если трек уже играет - просто остановить его
    if (currentTrack.isPlaying) {
      const audio = audioRefs.current[trackId]
      if (audio) {
        audio.pause()
      }
      setTracks(prev => prev.map(track => 
        track.id === trackId 
          ? { ...track, isPlaying: false }
          : track
      ))
      return
    }

    // Если режим смешивания выключен - остановить все остальные треки
    if (!mixMode) {
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        if (audio && id !== trackId) {
          audio.pause()
        }
      })
    }

    // Обновляем состояние треков
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        // Запускаем выбранный трек
        const audio = audioRefs.current[trackId]
        if (audio) {
          audio.play().catch(console.error)
        }
        return { ...track, isPlaying: true }
      } else if (!mixMode) {
        // Останавливаем все остальные треки только если режим смешивания выключен
        return { ...track, isPlaying: false }
      }
      return track
    }))
  }

  const updateVolume = (trackId: string, volume: number) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        const audio = audioRefs.current[trackId]
        if (audio) {
          audio.volume = volume / 100
        }
        return { ...track, volume }
      }
      return track
    }))
  }

  const toggleFavorite = (trackId: string) => {
    setFavorites(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    )
  }

  const startSleepTimer = () => {
    if (sleepTimer > 0) {
      setTimerActive(true)
      setTimeout(() => {
        // Остановить все треки
        tracks.forEach(track => {
          if (track.isPlaying) {
            const audio = audioRefs.current[track.id]
            if (audio) audio.pause()
          }
        })
        setTracks(prev => prev.map(track => ({ ...track, isPlaying: false })))
        setTimerActive(false)
      }, sleepTimer * 60 * 1000)
    }
  }

  const applyPreset = (preset: typeof presets[0]) => {
    // Остановить все текущие треки
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (audio) {
        audio.pause()
      }
    })

    // Включить режим смешивания
    setMixMode(true)
    setActivePreset(preset.id)

    // Применить предустановку
    setTracks(prev => prev.map(track => {
      const isInPreset = preset.tracks.includes(track.id)
      const newVolume = isInPreset ? preset.volumes[track.id] || track.volume : track.volume
      
      if (isInPreset) {
        // Запустить трек
        const audio = audioRefs.current[track.id]
        if (audio) {
          audio.volume = newVolume / 100
          audio.play().catch(console.error)
        }
        return { ...track, isPlaying: true, volume: newVolume }
      } else {
        // Остановить трек
        return { ...track, isPlaying: false }
      }
    }))
  }

  const stopAllTracks = () => {
    // Остановить все треки
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (audio) {
        audio.pause()
      }
    })
    setTracks(prev => prev.map(track => ({ ...track, isPlaying: false })))
    setActivePreset(null)
  }

  const filteredTracks = tracks.filter(track => track.category === activeTab)

  return (
    <div className="min-h-screen sleep-gradient p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Moon className="w-8 h-8 text-[hsl(var(--sleep-accent))]" />
            <h1 className="text-3xl font-semibold text-white">Спокойный Сон</h1>
          </div>
          <p className="text-gray-300 text-lg">Умиротворяющие звуки для глубокого отдыха</p>
        </div>

        {/* Presets */}
        <Card className="glass-effect border-[hsl(var(--sleep-border))] mb-8 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-6 h-6 text-[hsl(var(--sleep-accent))]" />
            <h3 className="text-white font-medium">Готовые комбинации</h3>
            <Badge className="bg-[hsl(var(--sleep-accent))]/20 text-[hsl(var(--sleep-accent))] border-[hsl(var(--sleep-accent))]/30">
              Популярные миксы
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {presets.map((preset) => {
              const isActive = activePreset === preset.id
              return (
                <Card 
                  key={preset.id} 
                  className={`glass-effect border-[hsl(var(--sleep-border))] p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer ${
                    isActive ? 'ring-2 ring-[hsl(var(--sleep-accent))] bg-[hsl(var(--sleep-accent))]/10' : ''
                  }`} 
                  onClick={() => applyPreset(preset)}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h4 className="text-white font-medium">{preset.name}</h4>
                      {isActive && (
                        <div className="w-2 h-2 bg-green-400 rounded-full pulse-animation"></div>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{preset.description}</p>
                    <Button 
                      size="sm" 
                      className={`w-full ${
                        isActive 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-[hsl(var(--sleep-accent))] hover:bg-[hsl(var(--sleep-accent))]/80'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Pause className="w-3 h-3 mr-2" />
                          Активен
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-2" />
                          Запустить
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </Card>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sleep Timer */}
          <Card className="glass-effect border-[hsl(var(--sleep-border))] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Timer className="w-6 h-6 text-[hsl(var(--sleep-accent))]" />
                <div>
                  <h3 className="text-white font-medium">Таймер сна</h3>
                  <p className="text-gray-400 text-sm">Автоматическое отключение</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">0</span>
                  <Slider
                    value={[sleepTimer]}
                    onValueChange={(value) => setSleepTimer(value[0])}
                    max={120}
                    step={15}
                    className="w-24"
                  />
                  <span className="text-white text-sm">120</span>
                </div>
                <Badge variant="secondary" className="bg-[hsl(var(--sleep-accent))] text-white">
                  {sleepTimer} мин
                </Badge>
                <Button 
                  onClick={startSleepTimer}
                  disabled={sleepTimer === 0 || timerActive}
                  className="bg-[hsl(var(--sleep-accent))] hover:bg-[hsl(var(--sleep-accent))]/80"
                >
                  {timerActive ? 'Активен' : 'Запустить'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Mix Mode */}
          <Card className="glass-effect border-[hsl(var(--sleep-border))] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Layers className="w-6 h-6 text-[hsl(var(--sleep-accent))]" />
                <div>
                  <h3 className="text-white font-medium">Режим смешивания</h3>
                  <p className="text-gray-400 text-sm">Воспроизведение нескольких треков</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge 
                  variant="secondary" 
                  className={`${mixMode 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-500 text-white'
                  }`}
                >
                  {mixMode ? 'Включён' : 'Выключен'}
                </Badge>
                <Button 
                  onClick={() => setMixMode(!mixMode)}
                  className={`${mixMode 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-[hsl(var(--sleep-accent))] hover:bg-[hsl(var(--sleep-accent))]/80'
                  }`}
                >
                  {mixMode ? 'Выключить' : 'Включить'}
                </Button>
                {tracks.some(track => track.isPlaying) && (
                  <Button 
                    onClick={stopAllTracks}
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Остановить всё
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-effect border-[hsl(var(--sleep-border))] mb-8">
            <TabsTrigger value="nature" className="data-[state=active]:bg-[hsl(var(--sleep-accent))] data-[state=active]:text-white">
              <TreePine className="w-4 h-4 mr-2" />
              Звуки природы
            </TabsTrigger>
            <TabsTrigger value="frequencies" className="data-[state=active]:bg-[hsl(var(--sleep-accent))] data-[state=active]:text-white">
              <Waves className="w-4 h-4 mr-2" />
              Частоты
            </TabsTrigger>
            <TabsTrigger value="stories" className="data-[state=active]:bg-[hsl(var(--sleep-accent))] data-[state=active]:text-white">
              <Moon className="w-4 h-4 mr-2" />
              Сказки
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTracks.map((track) => (
                <Card key={track.id} className="glass-effect border-[hsl(var(--sleep-border))] p-6 hover:bg-white/10 transition-all duration-300 hover-lift">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-[hsl(var(--sleep-accent))]/20 text-[hsl(var(--sleep-accent))] ${track.isPlaying ? 'pulse-animation' : ''}`}>
                        {track.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{track.name}</h3>
                        <p className="text-gray-400 text-sm">{track.duration}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(track.id)}
                      className={`${favorites.includes(track.id) ? 'text-red-400' : 'text-gray-400'} hover:text-red-400`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(track.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Play/Pause Button */}
                    <Button
                      onClick={() => togglePlay(track.id)}
                      className={`w-full ${
                        track.isPlaying 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-[hsl(var(--sleep-accent))] hover:bg-[hsl(var(--sleep-accent))]/80'
                      }`}
                    >
                      {track.isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Остановить
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Воспроизвести
                        </>
                      )}
                    </Button>

                    {/* Volume Control */}
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-gray-400" />
                      <Slider
                        value={[track.volume]}
                        onValueChange={(value) => updateVolume(track.id, value[0])}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-gray-400 text-sm w-8">{track.volume}%</span>
                    </div>

                    {/* Wave Visualization */}
                    {track.isPlaying && (
                      <div className="flex items-center justify-center gap-1 h-8">
                        {[...Array(15)].map((_, i) => {
                          const heights = [12, 18, 24, 30, 20, 35, 28, 40, 25, 32, 22, 38, 26, 20, 16];
                          return (
                            <div
                              key={i}
                              className="w-1 bg-gradient-to-t from-[hsl(var(--sleep-accent))] to-[hsl(var(--sleep-accent))]/60 rounded-full wave-animation"
                              style={{
                                height: `${heights[i]}px`,
                                animationDelay: `${i * 0.15}s`,
                                animationDuration: `${1.5 + Math.random() * 1}s`
                              }}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Hidden Audio Element */}
                  <audio
                    ref={(el) => {
                      if (el) {
                        audioRefs.current[track.id] = el
                      }
                    }}
                    src={track.url}
                    loop
                    preload="metadata"
                  />
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Currently Playing Summary */}
        {tracks.some(track => track.isPlaying) && (
          <Card className="glass-effect border-[hsl(var(--sleep-border))] mt-8 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Play className="w-5 h-5 text-[hsl(var(--sleep-accent))] pulse-animation" />
                Сейчас играет
              </h3>
              <Badge className="bg-[hsl(var(--sleep-accent))]/20 text-[hsl(var(--sleep-accent))] border-[hsl(var(--sleep-accent))]/30">
                {tracks.filter(track => track.isPlaying).length} трек
              </Badge>
            </div>
            <div className="space-y-3">
              {tracks
                .filter(track => track.isPlaying)
                .map(track => (
                  <div key={track.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded bg-[hsl(var(--sleep-accent))]/20 text-[hsl(var(--sleep-accent))]">
                        {track.icon}
                      </div>
                      <div>
                        <p className="text-white font-medium">{track.name}</p>
                        <p className="text-gray-400 text-sm">{track.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">{track.volume}%</span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App