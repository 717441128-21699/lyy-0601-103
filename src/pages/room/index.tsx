import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockPlayers, currentUser } from '@/data/mockPlayers';
import { generateRoomCode } from '@/utils/gameUtils';
import classNames from 'classnames';

export default function RoomPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState(mockPlayers.slice(0, 4));
  const [spectators, setSpectators] = useState(mockPlayers.slice(4, 5));
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState(true);

  useEffect(() => {
    const code = router.params.code || generateRoomCode();
    setRoomCode(code);
    
    const mode = router.params.mode;
    if (mode === 'quick') {
      setIsHost(false);
      setIsReady(true);
    }
    
    console.log('[Room] 进入房间:', code, '模式:', mode);
  }, [router.params]);

  const handleCopyCode = () => {
    console.log('[Room] 复制房间码:', roomCode);
    Taro.setClipboardData({
      data: roomCode,
      success: () => {
        Taro.showToast({
          title: '口令已复制',
          icon: 'success'
        });
      }
    });
  };

  const handleShare = () => {
    console.log('[Room] 分享房间');
    Taro.showActionSheet({
      itemList: ['微信分享', '生成二维码', '复制口令'],
      success: (res) => {
        if (res.tapIndex === 2) {
          handleCopyCode();
        } else {
          Taro.showToast({
            title: '功能开发中',
            icon: 'none'
          });
        }
      }
    });
  };

  const handleToggleReady = () => {
    console.log('[Room] 切换准备状态:', !isReady);
    setIsReady(!isReady);
  };

  const handleStartGame = () => {
    const readyCount = players.filter((p) => p.isReady).length;
    if (readyCount < 2) {
      Taro.showToast({
        title: '至少2人准备才能开始',
        icon: 'none'
      });
      return;
    }
    console.log('[Room] 开始游戏');
    Taro.navigateTo({
      url: '/pages/game/index'
    });
  };

  const handleSpectatorMode = () => {
    console.log('[Room] 切换观战模式');
    Taro.showModal({
      title: '切换观战模式',
      content: '确定要切换为观战模式吗？观战模式下不参与计分排名。',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '已切换为观战模式',
            icon: 'none'
          });
        }
      }
    });
  };

  const handleLeaveRoom = () => {
    console.log('[Room] 离开房间');
    Taro.showModal({
      title: '离开房间',
      content: '确定要离开房间吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.navigateBack();
        }
      }
    });
  };

  const readyCount = players.filter((p) => p.isReady).length;

  return (
    <View className={styles.page}>
      <View className={styles.roomInfo}>
        <View className={styles.roomHeader}>
          <Text className={styles.roomTitle}>反应挑战房</Text>
          <View className={styles.roomCode} onClick={handleCopyCode}>
            <Text>{roomCode}</Text>
            <Text className={styles.copyBtn}>复制</Text>
          </View>
        </View>
        <View className={styles.roomStats}>
          <View className={styles.roomStat}>
            <Text className={styles.roomStatLabel}>游戏时长</Text>
            <Text className={styles.roomStatValue}>3 分钟</Text>
          </View>
          <View className={styles.roomStat}>
            <Text className={styles.roomStatLabel}>玩家数量</Text>
            <Text className={styles.roomStatValue}>{players.length} / 6</Text>
          </View>
          <View className={styles.roomStat}>
            <Text className={styles.roomStatLabel}>已准备</Text>
            <Text className={styles.roomStatValue}>{readyCount} 人</Text>
          </View>
        </View>
      </View>

      <View className={styles.shareRow}>
        <Button className={styles.shareBtn} onClick={handleShare}>
          📤 分享房间
        </Button>
        <Button className={styles.shareBtn} onClick={handleCopyCode}>
          🔑 复制口令
        </Button>
      </View>

      <View className={styles.playerSection}>
        <Text className={styles.sectionTitle}>
          对战玩家 ({players.length})
        </Text>
        <View className={styles.playerGrid}>
          {players.map((player) => (
            <View
              key={player.id}
              className={classNames(styles.playerCard, {
                [styles.playerReady]: player.isReady
              })}
            >
              {player.isHost && (
                <Text className={styles.hostBadge}>房主</Text>
              )}
              <Image
                className={styles.playerAvatar}
                src={player.avatar}
                mode="aspectFill"
                style={{ borderColor: player.color }}
              />
              <Text className={styles.playerName}>{player.name}</Text>
              <Text
                className={classNames(styles.playerStatus, {
                  [styles.statusReady]: player.isReady,
                  [styles.statusNotReady]: !player.isReady
                })}
              >
                {player.isReady ? '已准备' : '未准备'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {spectators.length > 0 && (
        <View className={styles.spectatorSection}>
          <Text className={styles.sectionTitle}>
            观战 ({spectators.length})
          </Text>
          <View className={styles.spectatorList}>
            {spectators.map((spec) => (
              <View key={spec.id} className={styles.spectatorItem}>
                <Image
                  className={styles.spectatorAvatar}
                  src={spec.avatar}
                  mode="aspectFill"
                />
                <Text className={styles.spectatorName}>{spec.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.spectatorToggle}>
        <Text className={styles.spectatorLink} onClick={handleSpectatorMode}>
          切换为观战模式
        </Text>
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={styles.secondaryBtn}
          onClick={handleLeaveRoom}
        >
          离开
        </Button>
        {isHost ? (
          <Button
            className={classNames(styles.primaryBtn, {
              [styles.btnDisabled]: readyCount < 2
            })}
            onClick={handleStartGame}
          >
            开始游戏
          </Button>
        ) : (
          <Button
            className={classNames(styles.primaryBtn, {
              [styles.btnDisabled]: false
            })}
            onClick={handleToggleReady}
          >
            {isReady ? '取消准备' : '准备'}
          </Button>
        )}
      </View>
    </View>
  );
}
