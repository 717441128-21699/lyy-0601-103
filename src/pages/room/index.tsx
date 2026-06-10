import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockPlayers } from '@/data/mockPlayers';
import { generateRoomCode } from '@/utils/gameUtils';
import { getPlayerProfile, saveGlobalState, loadGlobalState } from '@/utils/globalState';
import classNames from 'classnames';
import type { Player } from '@/types/game';

export default function RoomPage() {
  const router = useRouter();
  const profile = getPlayerProfile();

  const meAsPlayer: Player = {
    id: 'me',
    name: profile.name,
    avatar: profile.avatar,
    color: profile.color,
    score: 0,
    combo: 0,
    maxCombo: 0,
    isReady: false,
    isHost: true,
    isSpectator: false,
    skill: profile.skill,
    shieldActive: false,
    correctCount: 0,
    wrongCount: 0
  };

  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [spectators, setSpectators] = useState<Player[]>(mockPlayers.filter(p => p.isSpectator));
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [isSpectator, setIsSpectator] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    const mode = router.params.mode;
    const code = router.params.code || generateRoomCode();
    setRoomCode(code);

    if (mode === 'quick') {
      setIsHost(false);
      const quickMe = { ...meAsPlayer, isHost: false, isReady: true };
      setIsReady(true);
      setPlayers([quickMe, ...mockPlayers.filter(p => !p.isSpectator).slice(0, 3)]);
    } else if (mode === 'join') {
      setIsHost(false);
      const joinMe = { ...meAsPlayer, isHost: false, isReady: false };
      setPlayers([joinMe, ...mockPlayers.filter(p => !p.isSpectator).slice(0, 3)]);
      Taro.showToast({ title: `已加入房间 ${code}`, icon: 'success' });
    } else {
      const hostMe = { ...meAsPlayer, isHost: true, isReady: false };
      setPlayers([hostMe, ...mockPlayers.filter(p => !p.isSpectator).slice(0, 3)]);
    }

    console.log('[Room] 进入房间:', code, '模式:', mode);
  }, [router.params]);

  const handleCopyCode = () => {
    console.log('[Room] 复制房间码:', roomCode);
    Taro.setClipboardData({
      data: roomCode,
      success: () => {
        Taro.showToast({ title: '口令已复制', icon: 'success' });
      }
    });
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleShareWechat = () => {
    console.log('[Room] 微信分享');
    Taro.showShareMenu({ withShareTicket: true });
    setShowShareDialog(false);
    Taro.showToast({ title: '请点击右上角转发分享', icon: 'none' });
  };

  const handleShowQRCode = () => {
    console.log('[Room] 生成二维码');
    setShowShareDialog(false);
    setShowQRCode(true);
  };

  const handleJoinByCode = () => {
    console.log('[Room] 口令加入');
    setShowShareDialog(false);
    Taro.showModal({
      title: '输入房间口令',
      editable: true,
      placeholderText: '请输入6位房间口令',
      success: (res) => {
        if (res.confirm && res.content) {
          Taro.showToast({ title: `正在加入房间 ${res.content}`, icon: 'none' });
        }
      }
    });
  };

  const handleToggleReady = () => {
    const newReady = !isReady;
    console.log('[Room] 切换准备状态:', newReady);
    setIsReady(newReady);
    setPlayers(prev => prev.map(p =>
      p.id === 'me' ? { ...p, isReady: newReady } : p
    ));
  };

  const handleStartGame = () => {
    const readyCount = players.filter(p => p.isReady).length;
    const activePlayers = players.filter(p => !p.isSpectator);
    if (readyCount < 2) {
      Taro.showToast({ title: '至少2人准备才能开始', icon: 'none' });
      return;
    }
    console.log('[Room] 开始游戏');
    saveGlobalState({
      roomCode,
      isSpectator,
      isReady,
      roomPlayers: players,
      roomSpectators: spectators
    });
    Taro.navigateTo({
      url: `/pages/game/index?roomCode=${roomCode}&isSpectator=${isSpectator ? '1' : '0'}`
    });
  };

  const handleSpectatorMode = () => {
    console.log('[Room] 切换观战模式');
    if (!isSpectator) {
      Taro.showModal({
        title: '切换为观战',
        content: '观战模式下不参与对战和计分，确定切换？',
        success: (res) => {
          if (res.confirm) {
            setIsSpectator(true);
            setIsReady(false);
            const meFromPlayers = players.find(p => p.id === 'me');
            const meAsSpec: Player = { ...(meFromPlayers || meAsPlayer), isSpectator: true, isReady: false };
            setPlayers(prev => prev.filter(p => p.id !== 'me'));
            setSpectators(prev => [...prev, meAsSpec]);
            Taro.showToast({ title: '已切换为观战模式', icon: 'none' });
          }
        }
      });
    } else {
      setIsSpectator(false);
      const meFromSpec = spectators.find(p => p.id === 'me');
      const meAsActive: Player = { ...(meFromSpec || meAsPlayer), isSpectator: false, isReady: false, isHost: isHost };
      setSpectators(prev => prev.filter(p => p.id !== 'me'));
      setPlayers(prev => [meAsActive, ...prev]);
      Taro.showToast({ title: '已切换为对战模式', icon: 'none' });
    }
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

  const readyCount = players.filter(p => p.isReady).length;
  const activePlayerCount = players.filter(p => !p.isSpectator).length;

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
            <Text className={styles.roomStatLabel}>对战玩家</Text>
            <Text className={styles.roomStatValue}>{activePlayerCount} / 6</Text>
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
        <Button className={styles.shareBtn} onClick={handleShowQRCode}>
          📱 二维码
        </Button>
      </View>

      <View className={styles.playerSection}>
        <Text className={styles.sectionTitle}>
          对战玩家 ({activePlayerCount})
        </Text>
        <View className={styles.playerGrid}>
          {players.filter(p => !p.isSpectator).map((player) => (
            <View
              key={player.id}
              className={classNames(styles.playerCard, {
                [styles.playerReady]: player.isReady,
                [styles.playerCardMe]: player.id === 'me'
              })}
            >
              {player.isHost && (
                <Text className={styles.hostBadge}>房主</Text>
              )}
              {player.id === 'me' && !player.isHost && (
                <Text className={styles.meBadge}>我</Text>
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
              <View key={spec.id} className={classNames(styles.spectatorItem, {
                [styles.spectatorMe]: spec.id === 'me'
              })}>
                <Image
                  className={styles.spectatorAvatar}
                  src={spec.avatar}
                  mode="aspectFill"
                  style={{ borderColor: spec.color }}
                />
                <Text className={styles.spectatorName}>
                  {spec.name}{spec.id === 'me' ? '(我)' : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.spectatorToggle}>
        <Text className={styles.spectatorLink} onClick={handleSpectatorMode}>
          {isSpectator ? '👥 切换为对战模式' : '👀 切换为观战模式'}
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
            开始游戏 ({readyCount}人准备)
          </Button>
        ) : isSpectator ? (
          <Button
            className={styles.primaryBtn}
            onClick={handleSpectatorMode}
          >
            👀 观战中
          </Button>
        ) : (
          <Button
            className={classNames(styles.primaryBtn, {
              [styles.btnReady]: isReady
            })}
            onClick={handleToggleReady}
          >
            {isReady ? '✅ 已准备' : '准备'}
          </Button>
        )}
      </View>

      {showShareDialog && (
        <View className={styles.shareDialog} onClick={() => setShowShareDialog(false)}>
          <View className={styles.shareDialogContent} onClick={(e) => { e.stopPropagation(); }}>
            <Text className={styles.shareDialogTitle}>邀请好友加入</Text>
            <View className={styles.shareCodeBox}>
              <Text className={styles.shareCodeLabel}>房间口令</Text>
              <Text className={styles.shareCodeValue}>{roomCode}</Text>
            </View>
            <View className={styles.shareActions}>
              <Button className={styles.shareActionBtn} onClick={handleCopyCode}>
                📋 复制口令
              </Button>
              <Button className={styles.shareActionBtn} onClick={handleShowQRCode}>
                📱 二维码
              </Button>
              <Button className={styles.shareActionBtn} onClick={handleShareWechat}>
                💬 微信分享
              </Button>
            </View>
            <Text className={styles.shareTip}>
              好友可通过「加入房间」输入口令或扫码加入
            </Text>
            <Button className={styles.shareCloseBtn} onClick={() => setShowShareDialog(false)}>
              关闭
            </Button>
          </View>
        </View>
      )}

      {showQRCode && (
        <View className={styles.shareDialog} onClick={() => setShowQRCode(false)}>
          <View className={styles.shareDialogContent} onClick={(e) => { e.stopPropagation(); }}>
            <Text className={styles.shareDialogTitle}>扫码加入房间</Text>
            <View className={styles.qrCodeBox}>
              <View className={styles.qrCodeGrid}>
                {Array.from({ length: 25 }).map((_, i) => (
                  <View
                    key={i}
                    className={classNames(styles.qrCodeCell, {
                      [styles.qrCellDark]: ((i * 7 + roomCode.charCodeAt(i % roomCode.length)) % 3) !== 0
                    })}
                  />
                ))}
              </View>
            </View>
            <Text className={styles.shareCodeValue}>房间: {roomCode}</Text>
            <Text className={styles.shareTip}>
              让好友打开小程序 → 加入房间 → 扫码或输入口令
            </Text>
            <Button className={styles.shareCloseBtn} onClick={() => setShowQRCode(false)}>
              关闭
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}
