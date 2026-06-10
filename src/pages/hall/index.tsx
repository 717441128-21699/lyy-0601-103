import React, { useState } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { dailyChallenges } from '@/data/mockRecords';
import { getPlayerProfile } from '@/utils/globalState';

export default function HallPage() {
  const profile = getPlayerProfile();
  const challenges = dailyChallenges;

  const handleCreateRoom = () => {
    console.log('[Hall] 创建房间');
    Taro.navigateTo({
      url: '/pages/character/index?mode=create'
    });
  };

  const handleJoinRoom = () => {
    console.log('[Hall] 加入房间');
    Taro.showModal({
      title: '输入房间口令',
      editable: true,
      placeholderText: '请输入6位房间口令',
      success: (res) => {
        if (res.confirm && res.content) {
          const code = res.content.trim();
          if (code.length === 0) {
            Taro.showToast({ title: '请输入口令', icon: 'none' });
            return;
          }
          Taro.navigateTo({
            url: `/pages/room/index?mode=join&code=${code}`
          });
        }
      }
    });
  };

  const handleQuickMatch = () => {
    console.log('[Hall] 快速匹配');
    Taro.showLoading({ title: '匹配中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.navigateTo({
        url: '/pages/room/index?mode=quick'
      });
    }, 1500);
  };

  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image
            className={styles.avatar}
            src={profile.avatar}
            mode="aspectFill"
            style={{ borderColor: profile.color }}
          />
          <View className={styles.userText}>
            <Text className={styles.userName}>{profile.name}</Text>
            <Text className={styles.userScore}>积分 12,450</Text>
          </View>
        </View>
        <View className={styles.seasonBadge}>
          <Text className={styles.seasonLabel}>本赛季排名</Text>
          <Text className={styles.seasonRank}>#4</Text>
        </View>
      </View>

      <View className={styles.titleSection}>
        <Text className={styles.gameTitle}>反应挑战</Text>
        <Text className={styles.gameSubtitle}>三分钟极速对决 · 考验你的反应速度</Text>
      </View>

      <View className={styles.dailyCard}>
        <View className={styles.dailyHeader}>
          <Text className={styles.dailyTitle}>
            <Text>🎯</Text>
            <Text>每日挑战</Text>
          </Text>
          <Text className={styles.dailyReward}>
            已完成 {completedCount}/{challenges.length}
          </Text>
        </View>
        <View className={styles.dailyList}>
          {challenges.map((challenge) => (
            <View key={challenge.id} className={styles.dailyItem}>
              <Text className={styles.dailyIcon}>
                {challenge.completed ? '✅' : '⬜'}
              </Text>
              <View className={styles.dailyContent}>
                <Text className={styles.dailyItemTitle}>{challenge.title}</Text>
                <Text className={styles.dailyItemDesc}>{challenge.description}</Text>
                <View className={styles.dailyProgress}>
                  <View
                    className={styles.dailyProgressBar}
                    style={{
                      width: `${Math.min(
                        (challenge.progress / challenge.target) * 100,
                        100
                      )}%`
                    }}
                  />
                </View>
              </View>
              <Text className={styles.dailyStatus}>
                +{challenge.reward}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.actionSection}>
        <Button
          className={`${styles.mainButton} ${styles.primaryButton}`}
          onClick={handleQuickMatch}
        >
          ⚡ 快速匹配
        </Button>
        
        <View className={styles.buttonRow}>
          <Button
            className={styles.halfButton}
            onClick={handleCreateRoom}
          >
            🏠 创建房间
          </Button>
          <Button
            className={styles.halfButton}
            onClick={handleJoinRoom}
          >
            🔑 加入房间
          </Button>
        </View>
      </View>

      <Text className={styles.bottomTip}>
        邀请好友一起玩，更有挑战乐趣！
      </Text>
    </View>
  );
}
