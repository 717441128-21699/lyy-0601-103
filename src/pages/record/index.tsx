import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { getPlayerProfile, loadGlobalState } from '@/utils/globalState';
import { friendRankList as defaultFriendRank } from '@/data/mockRecords';
import { getRankIcon } from '@/utils/gameUtils';
import classNames from 'classnames';
import type { GameRecord, RankItem } from '@/types/game';

type TabType = 'all' | 'win' | 'lose';

export default function RecordPage() {
  const profile = getPlayerProfile();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [friends, setFriends] = useState<RankItem[]>(defaultFriendRank);

  useEffect(() => {
    const state = loadGlobalState();
    setRecords(state.gameRecords);
    setFriends(state.friendRank);
  }, []);

  const filteredRecords = records.filter((record) => {
    if (activeTab === 'win') return record.isWin;
    if (activeTab === 'lose') return !record.isWin;
    return true;
  });

  const totalGames = records.length;
  const winGames = records.filter((r) => r.isWin).length;
  const winRate = totalGames > 0 ? Math.round((winGames / totalGames) * 100) : 0;
  const maxCombo = records.length > 0 ? Math.max(...records.map((r) => r.maxCombo)) : 0;
  const totalScore = records.reduce((sum, r) => sum + r.score, 0);

  const handleCompare = () => {
    Taro.showActionSheet({
      itemList: friends
        .filter((p) => !p.isMe)
        .map((p) => p.playerName),
      success: (res) => {
        console.log('[Record] 选择了好友:', res.tapIndex);
      }
    });
  };

  const meFriend = friends.find(f => f.isMe);

  return (
    <View className={styles.page}>
      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{totalGames}</Text>
          <Text className={styles.statLabel}>总场次</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classNames(styles.statValue, styles.statSuccess)}>
            {winRate}%
          </Text>
          <Text className={styles.statLabel}>胜率</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classNames(styles.statValue, styles.statHighlight)}>
            {maxCombo}
          </Text>
          <Text className={styles.statLabel}>最高连击</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classNames(styles.statValue, styles.statPink)}>
            {totalScore.toLocaleString()}
          </Text>
          <Text className={styles.statLabel}>累计积分</Text>
        </View>
      </View>

      <View className={styles.compareSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>好友对战</Text>
          <Button className={styles.compareBtn} onClick={handleCompare}>
            选择好友
          </Button>
        </View>
        <View className={styles.comparePlayers}>
          <View className={styles.comparePlayer}>
            <Image
              className={styles.compareAvatar}
              src={profile.avatar}
              mode="aspectFill"
            />
            <Text className={styles.compareName}>{profile.name}</Text>
            <Text className={styles.compareScore}>{meFriend?.score.toLocaleString() || '0'}</Text>
          </View>
          <Text className={styles.compareVs}>VS</Text>
          <View className={styles.comparePlayer}>
            <Image
              className={styles.compareAvatar}
              src={friends.find(f => !f.isMe)?.avatar || 'https://picsum.photos/id/64/200/200'}
              mode="aspectFill"
            />
            <Text className={styles.compareName}>{friends.find(f => !f.isMe)?.playerName || '好友'}</Text>
            <Text className={styles.compareScore}>{friends.find(f => !f.isMe)?.score.toLocaleString() || '0'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        <Text
          className={classNames(styles.tabItem, {
            [styles.tabActive]: activeTab === 'all'
          })}
          onClick={() => setActiveTab('all')}
        >
          全部
        </Text>
        <Text
          className={classNames(styles.tabItem, {
            [styles.tabActive]: activeTab === 'win'
          })}
          onClick={() => setActiveTab('win')}
        >
          胜利
        </Text>
        <Text
          className={classNames(styles.tabItem, {
            [styles.tabActive]: activeTab === 'lose'
          })}
          onClick={() => setActiveTab('lose')}
        >
          失败
        </Text>
      </View>

      <View className={styles.recordList}>
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <View key={record.id} className={styles.recordCard}>
              <View className={styles.recordHeader}>
                <View className={styles.recordRank}>
                  <Text className={styles.rankBadge}>{getRankIcon(record.rank)}</Text>
                  <Text
                    className={classNames(styles.rankText, {
                      [styles.rankWin]: record.isWin,
                      [styles.rankLose]: !record.isWin
                    })}
                  >
                    第 {record.rank} 名
                  </Text>
                </View>
                <Text className={styles.recordDate}>{record.date}</Text>
              </View>
              <View className={styles.recordHeader}>
                <Text className={styles.recordScore}>
                  {record.score.toLocaleString()} 分
                </Text>
                <Text className={styles.recordDate}>
                  {record.playerCount} 人对战
                </Text>
              </View>
              <View className={styles.recordStats}>
                <View className={styles.recordStatItem}>
                  <Text className={styles.recordStatValue}>{record.correctCount}</Text>
                  <Text className={styles.recordStatLabel}>正确</Text>
                </View>
                <View className={styles.recordStatItem}>
                  <Text className={styles.recordStatValue}>{record.wrongCount}</Text>
                  <Text className={styles.recordStatLabel}>错误</Text>
                </View>
                <View className={styles.recordStatItem}>
                  <Text className={styles.recordStatValue}>{record.maxCombo}</Text>
                  <Text className={styles.recordStatLabel}>最高连击</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text className={styles.emptyState}>暂无战绩记录</Text>
        )}
      </View>
    </View>
  );
}
