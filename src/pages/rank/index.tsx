import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import { seasonRankList, dailyRankList, friendRankList } from '@/data/mockRecords';
import { getRankIcon } from '@/utils/gameUtils';
import classNames from 'classnames';

type TabType = 'season' | 'daily' | 'friend';

export default function RankPage() {
  const [activeTab, setActiveTab] = useState<TabType>('season');

  const getRankData = () => {
    switch (activeTab) {
      case 'season':
        return seasonRankList;
      case 'daily':
        return dailyRankList;
      case 'friend':
        return friendRankList;
      default:
        return seasonRankList;
    }
  };

  const rankData = getRankData();
  const topThree = rankData.slice(0, 3);
  const restList = rankData.slice(3);
  const myRank = rankData.find((item) => item.isMe);

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        <Text
          className={classNames(styles.tabItem, {
            [styles.tabActive]: activeTab === 'season'
          })}
          onClick={() => setActiveTab('season')}
        >
          赛季榜
        </Text>
        <Text
          className={classNames(styles.tabItem, {
            [styles.tabActive]: activeTab === 'daily'
          })}
          onClick={() => setActiveTab('daily')}
        >
          每日榜
        </Text>
        <Text
          className={classNames(styles.tabItem, {
            [styles.tabActive]: activeTab === 'friend'
          })}
          onClick={() => setActiveTab('friend')}
        >
          好友榜
        </Text>
      </View>

      {topThree.length >= 3 && (
        <View className={styles.podium}>
          <View className={styles.podiumItem}>
            <Image
              className={classNames(styles.podiumAvatar, styles.podiumAvatarFirst)}
              src={topThree[0].avatar}
              mode="aspectFill"
            />
            <Text className={styles.podiumName}>{topThree[0].playerName}</Text>
            <Text className={styles.podiumScore}>
              {topThree[0].score.toLocaleString()}
            </Text>
            <Text className={styles.podiumRank}>🥇</Text>
            <View className={classNames(styles.podiumPedestal, styles.pedestalFirst)} />
          </View>

          <View className={styles.podiumItem}>
            <Image
              className={styles.podiumAvatar}
              src={topThree[1].avatar}
              mode="aspectFill"
            />
            <Text className={styles.podiumName}>{topThree[1].playerName}</Text>
            <Text className={styles.podiumScore}>
              {topThree[1].score.toLocaleString()}
            </Text>
            <Text className={styles.podiumRank}>🥈</Text>
            <View className={classNames(styles.podiumPedestal, styles.pedestalSecond)} />
          </View>

          <View className={styles.podiumItem}>
            <Image
              className={styles.podiumAvatar}
              src={topThree[2].avatar}
              mode="aspectFill"
            />
            <Text className={styles.podiumName}>{topThree[2].playerName}</Text>
            <Text className={styles.podiumScore}>
              {topThree[2].score.toLocaleString()}
            </Text>
            <Text className={styles.podiumRank}>🥉</Text>
            <View className={classNames(styles.podiumPedestal, styles.pedestalThird)} />
          </View>
        </View>
      )}

      <View className={styles.rankList}>
        {restList.map((item) => (
          <View
            key={item.playerId}
            className={classNames(styles.rankCard, {
              [styles.rankCardMe]: item.isMe
            })}
          >
            <Text className={styles.rankNumber}>{getRankIcon(item.rank)}</Text>
            <Image
              className={styles.rankAvatar}
              src={item.avatar}
              mode="aspectFill"
            />
            <View className={styles.rankInfo}>
              <View className={styles.rankName}>
                <Text>{item.playerName}</Text>
                {item.isFriend && <Text className={styles.friendBadge}>好友</Text>}
                {item.isMe && <Text className={styles.friendBadge}>我</Text>}
              </View>
              <Text className={styles.rankDetail}>
                {item.games} 局 · 胜率 {item.winRate}%
              </Text>
            </View>
            <View className={styles.rankScoreSection}>
              <Text className={styles.rankScore}>
                {item.score.toLocaleString()}
              </Text>
              <Text className={styles.rankWinRate}>积分</Text>
            </View>
          </View>
        ))}
      </View>

      {myRank && (
        <View className={styles.myRankSection}>
          <View className={styles.myRankCard}>
            <Text className={styles.rankNumber}>{myRank.rank}</Text>
            <Image
              className={styles.rankAvatar}
              src={myRank.avatar}
              mode="aspectFill"
            />
            <View className={styles.rankInfo}>
              <Text className={styles.rankName}>{myRank.playerName}</Text>
              <Text className={styles.rankDetail}>
                {myRank.games} 局 · 胜率 {myRank.winRate}%
              </Text>
            </View>
            <View className={styles.rankScoreSection}>
              <Text className={styles.rankScore}>
                {myRank.score.toLocaleString()}
              </Text>
              <Text className={styles.rankWinRate}>我的积分</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
