import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Heart, AlertTriangle, TrendingUp, Clock, Smile, Calendar, Zap, Moon, Sun, BarChart3, MessageSquare, Target, Timer, Repeat, ThumbsUp } from 'lucide-react';

interface Message {
  contact: string;
  message: string;
  timestamp: Date;
}

interface ChatAnalysisProps {
  messages: Message[];
}

export const ChatAnalysis = ({ messages }: ChatAnalysisProps) => {
  const analysis = useMemo(() => {
    if (!messages.length) return null;

    // Get unique contacts
    const contacts = [...new Set(messages.map(m => m.contact))];
    const [contact1, contact2] = contacts;

    // Message counts
    const contact1Messages = messages.filter(m => m.contact === contact1);
    const contact2Messages = messages.filter(m => m.contact === contact2);

    // Interest level calculation (based on message frequency and length)
    const contact1AvgLength = contact1Messages.reduce((sum, m) => sum + m.message.length, 0) / contact1Messages.length;
    const contact2AvgLength = contact2Messages.reduce((sum, m) => sum + m.message.length, 0) / contact2Messages.length;
    
    const totalMessages = messages.length;
    const contact1Interest = Math.round((contact1Messages.length / totalMessages) * 100);
    const contact2Interest = Math.round((contact2Messages.length / totalMessages) * 100);

    // Word frequency analysis
    const getTopWords = (contactMessages: Message[]) => {
      const words = contactMessages
        .flatMap(m => m.message.toLowerCase().split(/\s+/))
        .filter(word => word.length > 2 && !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'man', 'way', 'use'].includes(word));
      
      const wordCount: { [key: string]: number } = {};
      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
      
      return Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word, count]) => ({ word, count }));
    };

    const contact1TopWords = getTopWords(contact1Messages);
    const contact2TopWords = getTopWords(contact2Messages);

    // Red flags detection
    const redFlags = [];
    const redFlagKeywords = {
      'ex': ['ex', 'former', 'past relationship'],
      'money': ['broke', 'money', 'cash', 'poor', 'rich'],
      'blocking': ['block', 'blocked', 'ignore', 'ignored'],
      'toxic': ['hate', 'stupid', 'idiot', 'annoying']
    };

    Object.entries(redFlagKeywords).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        const count = messages.filter(m => 
          m.message.toLowerCase().includes(keyword)
        ).length;
        
        if (count > 0) {
          redFlags.push({
            category,
            message: `Mentioned "${keyword}" ${count} times`,
            severity: count > 10 ? 'high' : count > 5 ? 'medium' : 'low'
          });
        }
      });
    });

    // Compatibility score (simple algorithm based on response patterns)
    const mutualInterest = Math.min(contact1Interest, contact2Interest);
    const compatibilityScore = Math.round(
      (mutualInterest + (100 - Math.abs(contact1Interest - contact2Interest))) / 2
    );

    // Conversation frequency
    const dates = messages.map(m => m.timestamp.toDateString());
    const uniqueDates = new Set(dates);
    const conversationDays = uniqueDates.size;

    // Emoji analysis
    const getTopEmojis = (contactMessages: Message[]) => {
      const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      const emojis = contactMessages
        .flatMap(m => m.message.match(emojiRegex) || []);
      
      const emojiCount: { [key: string]: number } = {};
      emojis.forEach(emoji => {
        emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;
      });
      
      return Object.entries(emojiCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([emoji, count]) => ({ emoji, count }));
    };

    const contact1TopEmojis = getTopEmojis(contact1Messages);
    const contact2TopEmojis = getTopEmojis(contact2Messages);

    // Peak activity analysis
    const hourlyActivity = new Array(24).fill(0);
    const weeklyActivity = new Array(7).fill(0);
    
    messages.forEach(m => {
      const hour = m.timestamp.getHours();
      const day = m.timestamp.getDay();
      hourlyActivity[hour]++;
      weeklyActivity[day]++;
    });

    const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
    const peakDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
      weeklyActivity.indexOf(Math.max(...weeklyActivity))
    ];

    // Response time analysis (simplified)
    const sortedMessages = [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const responseTimes: { [key: string]: number[] } = { [contact1]: [], [contact2]: [] };
    
    for (let i = 1; i < sortedMessages.length; i++) {
      const current = sortedMessages[i];
      const previous = sortedMessages[i - 1];
      
      if (current.contact !== previous.contact) {
        const timeDiff = (current.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 60); // minutes
        if (timeDiff < 1440) { // Less than 24 hours
          responseTimes[current.contact].push(timeDiff);
        }
      }
    }

    const avgResponseTime = {
      [contact1]: responseTimes[contact1].length > 0 
        ? Math.round(responseTimes[contact1].reduce((a, b) => a + b, 0) / responseTimes[contact1].length)
        : 0,
      [contact2]: responseTimes[contact2].length > 0 
        ? Math.round(responseTimes[contact2].reduce((a, b) => a + b, 0) / responseTimes[contact2].length)
        : 0
    };

    // Conversation starter analysis
    const conversationStarters = { [contact1]: 0, [contact2]: 0 };
    let lastMessageTime = 0;
    
    sortedMessages.forEach(m => {
      const timeDiff = (m.timestamp.getTime() - lastMessageTime) / (1000 * 60 * 60); // hours
      if (timeDiff > 4) { // New conversation if gap > 4 hours
        conversationStarters[m.contact]++;
      }
      lastMessageTime = m.timestamp.getTime();
    });

    // Night owl vs early bird analysis
    const lateNightMessages = { [contact1]: 0, [contact2]: 0 };
    const earlyMorningMessages = { [contact1]: 0, [contact2]: 0 };
    
    messages.forEach(m => {
      const hour = m.timestamp.getHours();
      if (hour >= 22 || hour < 6) {
        lateNightMessages[m.contact]++;
      }
      if (hour >= 6 && hour < 10) {
        earlyMorningMessages[m.contact]++;
      }
    });

    // NEW ADVANCED FEATURES 🚀

    // Sentiment Analysis (basic)
    const getSentimentScore = (contactMessages: Message[]) => {
      const positiveWords = ['love', 'great', 'amazing', 'awesome', 'happy', 'good', 'nice', 'wonderful', 'perfect', 'beautiful', 'yes', 'thanks', 'thank', 'best', 'excited', 'fun'];
      const negativeWords = ['hate', 'bad', 'terrible', 'awful', 'sad', 'angry', 'no', 'sorry', 'worst', 'annoying', 'boring', 'stupid', 'frustrated', 'tired'];
      
      let positiveCount = 0;
      let negativeCount = 0;
      
      contactMessages.forEach(m => {
        const words = m.message.toLowerCase().split(/\s+/);
        positiveCount += words.filter(word => positiveWords.some(pos => word.includes(pos))).length;
        negativeCount += words.filter(word => negativeWords.some(neg => word.includes(neg))).length;
      });
      
      const total = positiveCount + negativeCount;
      return total > 0 ? Math.round((positiveCount / total) * 100) : 50;
    };

    const sentimentScores = {
      [contact1]: getSentimentScore(contact1Messages),
      [contact2]: getSentimentScore(contact2Messages)
    };

    // Double Text Analysis
    const doubleTextAnalysis = { [contact1]: 0, [contact2]: 0 };
    for (let i = 1; i < sortedMessages.length; i++) {
      const current = sortedMessages[i];
      const previous = sortedMessages[i - 1];
      const timeDiff = (current.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 60); // minutes
      
      if (current.contact === previous.contact && timeDiff < 5) {
        doubleTextAnalysis[current.contact]++;
      }
    }

    // Communication Style Analysis
    const getCommunicationStyle = (contactMessages: Message[]) => {
      const questions = contactMessages.filter(m => m.message.includes('?')).length;
      const exclamations = contactMessages.filter(m => m.message.includes('!')).length;
      const caps = contactMessages.filter(m => m.message === m.message.toUpperCase() && m.message.length > 3).length;
      
      return {
        questions: Math.round((questions / contactMessages.length) * 100),
        exclamations: Math.round((exclamations / contactMessages.length) * 100),
        caps: Math.round((caps / contactMessages.length) * 100)
      };
    };

    const communicationStyles = {
      [contact1]: getCommunicationStyle(contact1Messages),
      [contact2]: getCommunicationStyle(contact2Messages)
    };

    // Weekend vs Weekday Analysis
    const weekendMessages = { [contact1]: 0, [contact2]: 0 };
    const weekdayMessages = { [contact1]: 0, [contact2]: 0 };
    
    messages.forEach(m => {
      const day = m.timestamp.getDay();
      if (day === 0 || day === 6) { // Weekend
        weekendMessages[m.contact]++;
      } else { // Weekday
        weekdayMessages[m.contact]++;
      }
    });

    // Longest Conversation Gap Analysis
    const conversationGaps: number[] = [];
    for (let i = 1; i < sortedMessages.length; i++) {
      const current = sortedMessages[i];
      const previous = sortedMessages[i - 1];
      const timeDiff = (current.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 60 * 60 * 24); // days
      
      if (timeDiff > 1) { // Gap of more than 1 day
        conversationGaps.push(Math.round(timeDiff));
      }
    }

    const longestGap = conversationGaps.length > 0 ? Math.max(...conversationGaps) : 0;
    const averageGap = conversationGaps.length > 0 
      ? Math.round(conversationGaps.reduce((a, b) => a + b, 0) / conversationGaps.length)
      : 0;

    // Energy Level Analysis
    const getEnergyLevel = (contactMessages: Message[]) => {
      let energyScore = 0;
      const totalMessages = contactMessages.length;
      
      contactMessages.forEach(m => {
        const exclamations = (m.message.match(/!/g) || []).length;
        const caps = m.message === m.message.toUpperCase() && m.message.length > 3 ? 1 : 0;
        const emojis = (m.message.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
        
        energyScore += (exclamations * 2) + (caps * 3) + (emojis * 1);
      });
      
      return totalMessages > 0 ? Math.round((energyScore / totalMessages) * 10) : 0;
    };

    const energyLevels = {
      [contact1]: getEnergyLevel(contact1Messages),
      [contact2]: getEnergyLevel(contact2Messages)
    };

    // Consistency Score (how regular the communication is)
    const dailyMessageCounts = new Map<string, number>();
    messages.forEach(m => {
      const dateKey = m.timestamp.toDateString();
      dailyMessageCounts.set(dateKey, (dailyMessageCounts.get(dateKey) || 0) + 1);
    });

    const dailyCounts = Array.from(dailyMessageCounts.values());
    const avgDaily = dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length;
    const variance = dailyCounts.reduce((acc, count) => acc + Math.pow(count - avgDaily, 2), 0) / dailyCounts.length;
    const consistencyScore = Math.max(0, Math.round(100 - (Math.sqrt(variance) / avgDaily) * 50));

    return {
      contacts: { contact1, contact2 },
      messageCounts: { 
        [contact1]: contact1Messages.length, 
        [contact2]: contact2Messages.length 
      },
      interestLevels: { 
        [contact1]: contact1Interest, 
        [contact2]: contact2Interest 
      },
      topWords: { 
        [contact1]: contact1TopWords, 
        [contact2]: contact2TopWords 
      },
      topEmojis: {
        [contact1]: contact1TopEmojis,
        [contact2]: contact2TopEmojis
      },
      redFlags,
      compatibilityScore,
      conversationDays,
      totalMessages,
      avgMessageLength: { 
        [contact1]: Math.round(contact1AvgLength), 
        [contact2]: Math.round(contact2AvgLength) 
      },
      peakActivity: { hour: peakHour, day: peakDay },
      avgResponseTime,
      conversationStarters,
      activityPattern: {
        lateNight: lateNightMessages,
        earlyMorning: earlyMorningMessages,
        weekend: weekendMessages,
        weekday: weekdayMessages
      },
      sentimentScores,
      doubleTextAnalysis,
      communicationStyles,
      conversationGaps: { longest: longestGap, average: averageGap },
      energyLevels,
      consistencyScore
    };
  }, [messages]);

  if (!analysis) return null;

  const { 
    contacts, 
    messageCounts, 
    interestLevels, 
    topWords, 
    topEmojis,
    redFlags, 
    compatibilityScore, 
    conversationDays, 
    totalMessages,
    peakActivity,
    avgResponseTime,
    conversationStarters,
    activityPattern,
    sentimentScores,
    doubleTextAnalysis,
    communicationStyles,
    conversationGaps,
    energyLevels,
    consistencyScore
  } = analysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold gradient-text">Chat Wrapped</h1>
        <p className="text-muted-foreground">Your WhatsApp relationship analysis</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Interest Levels */}
        <Card className="stats-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-accent-pink" />
              Interest Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{contacts.contact1}</span>
                  <span className="font-bold">{interestLevels[contacts.contact1]}%</span>
                </div>
                <Progress 
                  value={interestLevels[contacts.contact1]} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{contacts.contact2}</span>
                  <span className="font-bold">{interestLevels[contacts.contact2]}%</span>
                </div>
                <Progress 
                  value={interestLevels[contacts.contact2]} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compatibility Score */}
        <Card className="stats-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-accent-blue" />
              Compatibility Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">
                {compatibilityScore}%
              </div>
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center mx-auto">
                <div className="text-2xl font-bold text-primary">
                  {compatibilityScore}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Count */}
        <Card className="stats-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-accent-purple" />
              Message Count
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">{contacts.contact1}</span>
                <span className="font-bold">{messageCounts[contacts.contact1]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{contacts.contact2}</span>
                <span className="font-bold">{messageCounts[contacts.contact2]}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span>Total Messages</span>
                  <span className="font-bold">{totalMessages}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Red Flags */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Red Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {redFlags.length > 0 ? (
              redFlags.slice(0, 5).map((flag, index) => (
                <div key={index} className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span className="text-sm">{flag.message}</span>
                  <Badge 
                    variant={flag.severity === 'high' ? 'destructive' : flag.severity === 'medium' ? 'secondary' : 'outline'}
                    className="ml-auto"
                  >
                    {flag.severity}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No major red flags detected! 🎉</p>
            )}
          </CardContent>
        </Card>

        {/* Top Words */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="text-lg">Top Used Words</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">{contacts.contact1}</h4>
              <div className="space-y-2">
                {topWords[contacts.contact1].map(({ word, count }, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{word}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">{contacts.contact2}</h4>
              <div className="space-y-2">
                {topWords[contacts.contact2].map(({ word, count }, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{word}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emoji Analysis */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smile className="h-5 w-5 text-accent-yellow" />
              Most Used Emojis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">{contacts.contact1}</h4>
              <div className="space-y-2">
                {topEmojis[contacts.contact1].length > 0 ? (
                  topEmojis[contacts.contact1].map(({ emoji, count }, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-lg">{emoji}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No emojis found</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">{contacts.contact2}</h4>
              <div className="space-y-2">
                {topEmojis[contacts.contact2].length > 0 ? (
                  topEmojis[contacts.contact2].map(({ emoji, count }, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-lg">{emoji}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No emojis found</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Time Analysis */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-accent-green" />
              Response Times
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">{contacts.contact1}</span>
                <span className="font-bold">
                  {avgResponseTime[contacts.contact1] > 0 
                    ? `${avgResponseTime[contacts.contact1]}m avg`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{contacts.contact2}</span>
                <span className="font-bold">
                  {avgResponseTime[contacts.contact2] > 0 
                    ? `${avgResponseTime[contacts.contact2]}m avg`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="pt-2 border-t border-border text-center">
                <div className="text-sm text-muted-foreground">
                  {avgResponseTime[contacts.contact1] > 0 && avgResponseTime[contacts.contact2] > 0 ? (
                    avgResponseTime[contacts.contact1] < avgResponseTime[contacts.contact2] 
                      ? `${contacts.contact1} replies faster ⚡`
                      : `${contacts.contact2} replies faster ⚡`
                  ) : (
                    'Response time analysis'
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Activity & Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peak Activity */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-accent-orange" />
              Peak Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">
                {peakActivity.hour}:00
              </div>
              <div className="text-sm text-muted-foreground">Peak hour</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{peakActivity.day}</div>
              <div className="text-sm text-muted-foreground">Most active day</div>
            </div>
          </CardContent>
        </Card>

        {/* Conversation Starters */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-accent-purple" />
              Conversation Starters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{contacts.contact1}</span>
                <span className="font-bold">{conversationStarters[contacts.contact1]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{contacts.contact2}</span>
                <span className="font-bold">{conversationStarters[contacts.contact2]}</span>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border">
              {conversationStarters[contacts.contact1] > conversationStarters[contacts.contact2] 
                ? `${contacts.contact1} starts more conversations`
                : conversationStarters[contacts.contact2] > conversationStarters[contacts.contact1]
                ? `${contacts.contact2} starts more conversations`
                : 'Both equally initiate conversations'
              }
            </div>
          </CardContent>
        </Card>

        {/* Night Owl vs Early Bird */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Moon className="h-5 w-5 text-accent-indigo" />
              Activity Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  <span className="text-sm">Night Owl</span>
                </div>
                <span className="font-bold">
                  {activityPattern.lateNight[contacts.contact1] > activityPattern.lateNight[contacts.contact2] 
                    ? contacts.contact1 
                    : contacts.contact2}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <span className="text-sm">Early Bird</span>
                </div>
                <span className="font-bold">
                  {activityPattern.earlyMorning[contacts.contact1] > activityPattern.earlyMorning[contacts.contact2] 
                    ? contacts.contact1 
                    : contacts.contact2}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Analysis */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ThumbsUp className="h-5 w-5 text-accent-green" />
              Sentiment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{contacts.contact1}</span>
                  <span className="font-bold">{sentimentScores[contacts.contact1]}% positive</span>
                </div>
                <Progress 
                  value={sentimentScores[contacts.contact1]} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{contacts.contact2}</span>
                  <span className="font-bold">{sentimentScores[contacts.contact2]}% positive</span>
                </div>
                <Progress 
                  value={sentimentScores[contacts.contact2]} 
                  className="h-2"
                />
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border">
              {sentimentScores[contacts.contact1] > sentimentScores[contacts.contact2] 
                ? `${contacts.contact1} is more positive 😊`
                : sentimentScores[contacts.contact2] > sentimentScores[contacts.contact1]
                ? `${contacts.contact2} is more positive 😊`
                : 'Both equally positive!'
              }
            </div>
          </CardContent>
        </Card>

        {/* Communication Style */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-accent-blue" />
              Communication Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">{contacts.contact1}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Questions</span>
                  <span>{communicationStyles[contacts.contact1].questions}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Exclamations</span>
                  <span>{communicationStyles[contacts.contact1].exclamations}%</span>
                </div>
                <div className="flex justify-between">
                  <span>ALL CAPS</span>
                  <span>{communicationStyles[contacts.contact1].caps}%</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">{contacts.contact2}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Questions</span>
                  <span>{communicationStyles[contacts.contact2].questions}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Exclamations</span>
                  <span>{communicationStyles[contacts.contact2].exclamations}%</span>
                </div>
                <div className="flex justify-between">
                  <span>ALL CAPS</span>
                  <span>{communicationStyles[contacts.contact2].caps}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* More Advanced Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Double Text Analysis */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Repeat className="h-5 w-5 text-accent-purple" />
              Double Texting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{contacts.contact1}</span>
                <span className="font-bold">{doubleTextAnalysis[contacts.contact1]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{contacts.contact2}</span>
                <span className="font-bold">{doubleTextAnalysis[contacts.contact2]}</span>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border">
              {doubleTextAnalysis[contacts.contact1] > doubleTextAnalysis[contacts.contact2] 
                ? `${contacts.contact1} double texts more`
                : doubleTextAnalysis[contacts.contact2] > doubleTextAnalysis[contacts.contact1]
                ? `${contacts.contact2} double texts more`
                : 'Equal double texting'
              }
            </div>
          </CardContent>
        </Card>

        {/* Energy Levels */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-accent-orange" />
              Energy Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{contacts.contact1}</span>
                <span className="font-bold">{energyLevels[contacts.contact1]}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{contacts.contact2}</span>
                <span className="font-bold">{energyLevels[contacts.contact2]}/10</span>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border">
              {energyLevels[contacts.contact1] > energyLevels[contacts.contact2] 
                ? `${contacts.contact1} is more energetic ⚡`
                : energyLevels[contacts.contact2] > energyLevels[contacts.contact1]
                ? `${contacts.contact2} is more energetic ⚡`
                : 'Equal energy levels'
              }
            </div>
          </CardContent>
        </Card>

        {/* Conversation Gaps */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Timer className="h-5 w-5 text-accent-indigo" />
              Conversation Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">
                {conversationGaps.longest}
              </div>
              <div className="text-sm text-muted-foreground">Longest gap (days)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{conversationGaps.average}</div>
              <div className="text-sm text-muted-foreground">Average gap (days)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekend vs Weekday Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-accent-yellow" />
              Weekend vs Weekday Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Weekend Messages</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">{contacts.contact1}</span>
                  <span className="font-bold">{activityPattern.weekend[contacts.contact1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">{contacts.contact2}</span>
                  <span className="font-bold">{activityPattern.weekend[contacts.contact2]}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Weekday Messages</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">{contacts.contact1}</span>
                  <span className="font-bold">{activityPattern.weekday[contacts.contact1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">{contacts.contact2}</span>
                  <span className="font-bold">{activityPattern.weekday[contacts.contact2]}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consistency Score */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-accent-pink" />
              Communication Consistency
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">
                {consistencyScore}%
              </div>
              <div className="text-sm text-muted-foreground">
                {consistencyScore > 80 ? 'Very consistent!' 
                : consistencyScore > 60 ? 'Pretty consistent' 
                : consistencyScore > 40 ? 'Somewhat sporadic'
                : 'Very unpredictable'}
              </div>
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center mx-auto mt-2">
                <div className="text-xl font-bold text-primary">
                  {consistencyScore}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="stats-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold gradient-text">{conversationDays}</div>
            <div className="text-sm text-muted-foreground">Days chatting</div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold gradient-text">
              {Math.round(totalMessages / conversationDays)}
            </div>
            <div className="text-sm text-muted-foreground">Messages per day</div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold gradient-text">
              {analysis.avgMessageLength[contacts.contact1] > analysis.avgMessageLength[contacts.contact2] 
                ? contacts.contact1 
                : contacts.contact2}
            </div>
            <div className="text-sm text-muted-foreground">Longer messages</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};