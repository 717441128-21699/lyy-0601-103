import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { dailyChallenges } from '@/data/mockRecords';
import { getPlayerProfile, getMyCoins, getRoomFromRegistry } from '@/utils/globalState';

export default function HallPage() {
  const profile = getPlayerProfile();
  const [myCoins, setMyCoins] = useState(0);

  useEffect(() => {
    setMyCoins(getMyCoins());
  }, []);

  const challenges = dailyChallenges;

  const handleCreateRoom = () => {
    Taro.navigateTo({
      url: '/pages/character/index?mode=create'
    });
  };

  const handleJoinRoom = () => {
    Taro.showActionSheet({
      itemList: ['🔑 输入口令加入', '📷 扫码加入'],
      success: (res) => {
        if (res.tapIndex === 0) {
          handleJoinByCode();
        } else {
          handleScanQRCode();
        }
      }
    });
  };

  const handleJoinByCode = () => {
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
          const existing = getRoomFromRegistry(code);
          if (!existing) {
            Taro.showToast({ title: '未找到该房间，请检查口令', icon: 'none' });
            return;
          }
          if (existing.status === 'playing') {
            Taro.showToast({ title: '该房间正在游戏中，请稍后再试', icon: 'none' });
            return;
          }
          Taro.navigateTo({
            url: `/pages/room/index?mode=join&code=${code}`
          });
        }
      }
    });
  };

  const handleScanQRCode = () => {
    Taro.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        const result = res.result || '';
        const codeMatch = result.match(/room[_=]([A-Za-z0-9]{4,8})/i) || result.match(/^([A-Za-z0-9]{4,8})$/);
        if (codeMatch && codeMatch[1]) {
          const code = codeMatch[1].toUpperCase();
          const existing = getRoomFromRegistry(code);
          if (existing) {
            if (existing.status === 'playing') {
              Taro.showToast({ title: '该房间正在游戏中', icon: 'none' });
              return;
            }
            Taro.navigateTo({
              url: `/pages/room/index?mode=join&code=${code}`
            });
          } else {
            Taro.showToast({ title: `未找到房间 ${code}，口令无效`, icon: 'none' });
          }
        } else {
          Taro.showToast({ title: '无法识别房间码，请重试', icon: 'none' });
        }
      },
      fail: () => {
        Taro.showToast({ title: '扫码取消或失败', icon: 'none' });
      }
    });
  };

  const handleQuickMatch = () => {
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
            <Text className={styles.userScore}>积分 {myCoins.toLocaleString()}</Text>
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
