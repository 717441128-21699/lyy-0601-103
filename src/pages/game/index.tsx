import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockPlayers, mockSkills } from '@/data/mockPlayers';
import { generateRandomQuestion, COLOR_MAP } from '@/data/mockQuestions';
import { mockItems } from '@/data/mockItems';
import { formatTime, getRankIcon } from '@/utils/gameUtils';
import { getPlayerProfile, getMyItems, addGameRecord, updateRankAfterGame, saveRoomToRegistry } from '@/utils/globalState';
import classNames from 'classnames';
import type { Question, Player, Skill } from '@/types/game';

type GamePhase = 'countdown' | 'playing' | 'result';

export default function GamePage() {
  const router = useRouter();
  const profile = getPlayerProfile();
  const isSpectatorParam = router.params.isSpectator === '1';

  const mySkill: Skill = profile.skill || mockSkills[0];
  const myItemsList = getMyItems().filter(i => i.type !== 'emoji').slice(0, 3);

  const [gamePhase, setGamePhase] = useState<GamePhase>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(180);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [myCombo, setMyCombo] = useState(0);
  const [myMaxCombo, setMyMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSpectator, setIsSpectator] = useState(isSpectatorParam);
  const [players, setPlayers] = useState<Player[]>(mockPlayers.slice(0, 4).map(p => ({ ...p, score: 0, combo: 0 })));
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<
    { id: number; emoji: string; x: number; y: number }[]
  >([]);
  const [skillCooldown, setSkillCooldown] = useState(0);
  const [shieldActive, setShieldActive] = useState(false);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    myItemsList.forEach(i => { counts[i.id] = i.count || 0; });
    return counts;
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emojiIdRef = useRef(0);

  const emojis = ['👍', '😂', '😠', '💪', '🎉', '❤️'];

  const startGame = useCallback(() => {
    console.log('[Game] 开始游戏, 观战:', isSpectator);
    setGamePhase('playing');
    setTimeLeft(180);
    setMyScore(0);
    setMyCombo(0);
    setMyMaxCombo(0);
    setCorrectCount(0);
    setWrongCount(0);
    setQuestionIndex(0);
    nextQuestion();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isSpectator]);

  useEffect(() => {
    if (gamePhase === 'countdown') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            startGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gamePhase, startGame]);

  useEffect(() => {
    if (skillCooldown > 0) {
      const timer = setInterval(() => {
        setSkillCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [skillCooldown]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (questionTimerRef.current) clearTimeout(questionTimerRef.current);
    };
  }, []);

  const nextQuestion = useCallback(() => {
    const question = generateRandomQuestion();
    setCurrentQuestion(question);
    setSelectedOption(null);
    setIsCorrect(null);
    setQuestionIndex((prev) => prev + 1);
  }, []);

  const handleAnswer = (answer: string) => {
    if (selectedOption !== null || !currentQuestion || isSpectator) return;

    setSelectedOption(answer);
    const correct = answer === currentQuestion.answer;
    setIsCorrect(correct);

    if (correct) {
      const comboBonus = Math.floor(myCombo * 5);
      const baseScore = 50;
      const score = baseScore + comboBonus;
      setMyScore((prev) => prev + score);
      setMyCombo((prev) => {
        const newCombo = prev + 1;
        setMyMaxCombo((max) => Math.max(max, newCombo));
        return newCombo;
      });
      setCorrectCount((prev) => prev + 1);
      simulateOtherPlayers();
    } else {
      setMyScore((prev) => Math.max(0, prev - 10));
      setMyCombo(0);
      setWrongCount((prev) => prev + 1);
    }

    questionTimerRef.current = setTimeout(() => {
      nextQuestion();
    }, 800);
  };

  const simulateOtherPlayers = () => {
    setPlayers((prev) =>
      prev.map((p) => {
        const shouldAnswer = Math.random() > 0.3;
        if (shouldAnswer) {
          const isCorrect = Math.random() > 0.4;
          if (isCorrect) {
            return {
              ...p,
              score: p.score + 50 + Math.floor(p.combo * 5),
              combo: p.combo + 1,
              maxCombo: Math.max(p.maxCombo, p.combo + 1)
            };
          } else {
            return {
              ...p,
              score: Math.max(0, p.score - 10),
              combo: 0
            };
          }
        }
        return p;
      })
    );
  };

  const endGame = useCallback(() => {
    console.log('[Game] 游戏结束');
    if (timerRef.current) clearInterval(timerRef.current);
    if (questionTimerRef.current) clearTimeout(questionTimerRef.current);
    setGamePhase('result');

    if (!isSpectator) {
      const rank = finalRank();
      const myPosition = rank.findIndex((p) => 'isMe' in p && p.isMe) + 1;
      const isWin = myPosition === 1;
      const playerCount = rank.length;
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      addGameRecord({
        id: `record-${Date.now()}`,
        date: dateStr,
        duration: 180,
        playerCount,
        rank: myPosition,
        score: myScore,
        correctCount,
        wrongCount,
        maxCombo: myMaxCombo,
        isWin
      });

      updateRankAfterGame(myScore, isWin);
    }

    const roomCodeParam = router.params.roomCode;
    if (roomCodeParam) {
      saveRoomToRegistry({
        code: roomCodeParam,
        hostId: 'me',
        players: players.map(p => ({ ...p, score: 0, combo: 0 })),
        spectators: [],
        status: 'ended',
        gameTime: 180
      });
    }
  }, [isSpectator, myScore, correctCount, wrongCount, myMaxCombo, players, router.params.roomCode]);

  const handleUseItem = (itemId: string) => {
    const currentCount = itemCounts[itemId] || 0;
    if (currentCount <= 0) {
      Taro.showToast({ title: '道具已用完', icon: 'none' });
      return;
    }

    console.log('[Game] 使用道具:', itemId);
    const item = myItemsList.find(i => i.id === itemId);
    if (!item) return;

    setItemCounts(prev => ({ ...prev, [itemId]: currentCount - 1 }));

    if (item.type === 'shield') {
      setShieldActive(true);
      Taro.showToast({ title: '护盾已激活', icon: 'none' });
    } else if (item.type === 'interfere') {
      Taro.showActionSheet({
        itemList: players.filter((p) => !p.isSpectator).map((p) => p.name),
        success: (res) => {
          Taro.showToast({
            title: `对 ${players[res.tapIndex].name} 使用了${item.name}`,
            icon: 'none'
          });
        }
      });
    } else if (item.type === 'bonus') {
      Taro.showToast({ title: `${item.name}已激活`, icon: 'none' });
    }
  };

  const handleUseSkill = () => {
    if (skillCooldown > 0) {
      Taro.showToast({ title: `冷却中 ${skillCooldown}s`, icon: 'none' });
      return;
    }
    console.log('[Game] 使用技能:', mySkill.name);
    setSkillCooldown(mySkill.cooldown);
    Taro.showToast({ title: `${mySkill.name} 已释放`, icon: 'none' });
  };

  const handleSendEmoji = (emoji: string) => {
    const id = emojiIdRef.current++;
    const x = Math.random() * 400 + 100;
    const y = Math.random() * 200 + 300;
    setFloatingEmojis((prev) => [...prev, { id, emoji, x, y }]);
    setShowEmojiPicker(false);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
    }, 2000);
  };

  const handlePlayAgain = () => {
    console.log('[Game] 再来一局');
    setGamePhase('countdown');
    setCountdown(3);
    setPlayers(mockPlayers.slice(0, 4).map((p) => ({ ...p, score: 0, combo: 0 })));
    const counts: Record<string, number> = {};
    myItemsList.forEach(i => { counts[i.id] = i.count || 0; });
    setItemCounts(counts);
  };

  const handleBackToRoom = () => {
    console.log('[Game] 返回房间');
    Taro.navigateBack();
  };

  const finalRank = () => {
    const allPlayers = [
      ...players.filter((p) => !p.isSpectator),
    ];
    if (!isSpectator) {
      allPlayers.push({
        id: 'me',
        name: profile.name,
        avatar: profile.avatar,
        color: profile.color,
        score: myScore,
        combo: myCombo,
        maxCombo: myMaxCombo,
        isReady: true,
        isHost: true,
        isSpectator: false,
        skill: mySkill,
        shieldActive,
        correctCount,
        wrongCount,
        isMe: true
      } as Player & { isMe: boolean });
    }
    return allPlayers.sort((a, b) => b.score - a.score);
  };

  const myRank = isSpectator ? 0 : finalRank().findIndex((p) => 'isMe' in p && p.isMe) + 1;

  const getTimerClass = () => {
    if (timeLeft <= 10) return styles.timerDanger;
    if (timeLeft <= 30) return styles.timerWarning;
    return '';
  };

  const renderOption = (option: string) => {
    const isSelected = selectedOption === option;
    const showCorrect = selectedOption !== null && option === currentQuestion?.answer;
    const showWrong = isSelected && !isCorrect;

    if (currentQuestion?.type === 'color') {
      const colorValue = COLOR_MAP[option] || '#999';
      return (
        <View
          key={option}
          className={classNames(styles.colorOptionBtn, {
            [styles.optionCorrect]: showCorrect,
            [styles.optionWrong]: showWrong
          })}
          onClick={() => handleAnswer(option)}
        >
          <View className={styles.colorOptionBlock} style={{ backgroundColor: colorValue }} />
          <Text className={styles.colorOptionName}>{option}</Text>
        </View>
      );
    }

    return (
      <Button
        key={option}
        className={classNames(styles.optionBtn, {
          [styles.optionCorrect]: showCorrect,
          [styles.optionWrong]: showWrong
        })}
        onClick={() => handleAnswer(option)}
      >
        {option}
      </Button>
    );
  };

  return (
    <View className={styles.page}>
      {gamePhase === 'countdown' && (
        <View className={styles.countdownOverlay}>
          <Text className={styles.countdownNumber}>{countdown}</Text>
        </View>
      )}

      {gamePhase === 'playing' && currentQuestion && (
        <>
          <View className={styles.gameHeader}>
            <View className={styles.timer}>
              <Text className={styles.timerIcon}>⏱️</Text>
              <Text className={classNames(styles.timerText, getTimerClass())}>
                {formatTime(timeLeft)}
              </Text>
            </View>
            {myCombo > 0 && !isSpectator && (
              <Text className={styles.comboBadge}>🔥 {myCombo} 连击</Text>
            )}
            {isSpectator && (
              <Text className={styles.comboBadge}>👀 观战中</Text>
            )}
          </View>

          <ScrollView scrollX className={styles.scoreBoard}>
            {!isSpectator && (
              <View className={styles.playerScoreItem}>
                <Image
                  className={styles.playerScoreAvatar}
                  src={profile.avatar}
                  mode="aspectFill"
                  style={{ borderColor: profile.color }}
                />
                <Text className={styles.playerScoreName}>{profile.name}</Text>
                <Text className={styles.playerScoreValue}>{myScore}</Text>
              </View>
            )}
            {players.map((player) => (
              <View key={player.id} className={styles.playerScoreItem}>
                <Image
                  className={styles.playerScoreAvatar}
                  src={player.avatar}
                  mode="aspectFill"
                  style={{ borderColor: player.color }}
                />
                <Text className={styles.playerScoreName}>{player.name}</Text>
                <Text className={styles.playerScoreValue}>{player.score}</Text>
              </View>
            ))}
          </ScrollView>

          <View className={styles.questionSection}>
            <Text className={styles.questionIndex}>第 {questionIndex} 题</Text>

            {currentQuestion.type === 'color' && (
              <>
                <View
                  className={classNames(styles.questionContent, styles.colorQuestion)}
                  style={{ backgroundColor: currentQuestion.color }}
                />
                <Text className={styles.questionPrompt}>这是什么颜色？</Text>
              </>
            )}

            {currentQuestion.type === 'number' && (
              <>
                <Text className={classNames(styles.questionContent, styles.numberQuestion)}>
                  {currentQuestion.content}
                </Text>
                <Text className={styles.questionPrompt}>点击对应的数字</Text>
              </>
            )}

            {currentQuestion.type === 'direction' && (
              <>
                <Text className={classNames(styles.questionContent, styles.directionQuestion)}>
                  {currentQuestion.content}
                </Text>
                <Text className={styles.questionPrompt}>这是什么方向？</Text>
              </>
            )}

            <View className={styles.optionsGrid}>
              {currentQuestion.options.map((option) => renderOption(option))}
            </View>
          </View>

          {!isSpectator && (
            <View className={styles.toolBar}>
              <View className={styles.itemList}>
                <Button className={styles.itemBtn} onClick={handleUseSkill}>
                  {mySkill.icon}
                  {skillCooldown > 0 && (
                    <View className={styles.skillCooldown}>{skillCooldown}</View>
                  )}
                </Button>
                {myItemsList.map((item) => (
                  <Button
                    key={item.id}
                    className={styles.itemBtn}
                    onClick={() => handleUseItem(item.id)}
                  >
                    {item.icon}
                    {(itemCounts[item.id] || 0) > 0 && (
                      <Text className={styles.itemCount}>{itemCounts[item.id]}</Text>
                    )}
                  </Button>
                ))}
              </View>
              <Button
                className={styles.emojiBtn}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                😀
              </Button>
            </View>
          )}

          {showEmojiPicker && (
            <View className={styles.emojiPicker}>
              {emojis.map((emoji) => (
                <Text
                  key={emoji}
                  className={styles.emojiPickerItem}
                  onClick={() => handleSendEmoji(emoji)}
                >
                  {emoji}
                </Text>
              ))}
            </View>
          )}

          {floatingEmojis.map((e) => (
            <View
              key={e.id}
              className={styles.floatingEmoji}
              style={{ left: e.x, top: e.y }}
            >
              {e.emoji}
            </View>
          ))}
        </>
      )}

      {gamePhase === 'result' && (
        <View className={styles.resultOverlay}>
          <View className={styles.resultContainer}>
            <View className={styles.resultHeader}>
              <Text className={styles.resultTitle}>游戏结束</Text>
              {isSpectator ? (
                <Text className={styles.resultRank}>👀 观战模式</Text>
              ) : (
                <>
                  <Text className={styles.resultRank}>
                    {getRankIcon(myRank)} 第 {myRank} 名
                  </Text>
                  <Text className={styles.resultScore}>
                    最终得分：
                    <Text className={styles.resultScoreValue}>
                      {myScore.toLocaleString()}
                    </Text>
                  </Text>
                </>
              )}
            </View>

            {!isSpectator && (
              <View className={styles.statsRow}>
                <View className={styles.statItem}>
                  <Text className={styles.statValue}>{correctCount}</Text>
                  <Text className={styles.statLabel}>正确</Text>
                </View>
                <View className={styles.statItem}>
                  <Text className={styles.statValue}>{wrongCount}</Text>
                  <Text className={styles.statLabel}>错误</Text>
                </View>
                <View className={styles.statItem}>
                  <Text className={styles.statValue}>{myMaxCombo}</Text>
                  <Text className={styles.statLabel}>最高连击</Text>
                </View>
                <View className={styles.statItem}>
                  <Text className={styles.statValue}>{questionIndex}</Text>
                  <Text className={styles.statLabel}>答题数</Text>
                </View>
              </View>
            )}

            <Text className={styles.rankListTitle}>本局排名</Text>
            <View className={styles.rankList}>
              {finalRank().map((player, index) => (
                <View
                  key={player.id}
                  className={classNames(styles.rankItem, {
                    [styles.rankItemMe]: 'isMe' in player && player.isMe
                  })}
                >
                  <Text className={styles.rankNum}>
                    {getRankIcon(index + 1)}
                  </Text>
                  <Image
                    className={styles.rankAvatar}
                    src={player.avatar}
                    mode="aspectFill"
                  />
                  <Text className={styles.rankName}>
                    {player.name}
                    {'isMe' in player && player.isMe ? ' (我)' : ''}
                  </Text>
                  <Text className={styles.rankScore}>{player.score}</Text>
                </View>
              ))}
            </View>

            <View className={styles.resultActions}>
              <Button
                className={classNames(styles.actionBtn, styles.secondaryAction)}
                onClick={handleBackToRoom}
              >
                返回房间
              </Button>
              <Button
                className={classNames(styles.actionBtn, styles.primaryAction)}
                onClick={handlePlayAgain}
              >
                再来一局
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
