import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockPlayers } from '@/data/mockPlayers';
import { generateRoomCode } from '@/utils/gameUtils';
import {
  getPlayerProfile,
  saveRoomToRegistry,
  getRoomFromRegistry,
  removeRoomFromRegistry
} from '@/utils/globalState';
import classNames from 'classnames';
import type { Player } from '@/types/game';

export default function RoomPage() {
  const router = useRouter();
  const profile = getPlayerProfile();

  const buildMe = (overrides?: Partial<Player>): Player => ({
    id: 'me',
    name: profile.name,
    avatar: profile.avatar,
    color: profile.color,
    score: 0,
    combo: 0,
    maxCombo: 0,
    isReady: false,
    isHost: false,
    isSpectator: false,
    skill: profile.skill,
    shieldActive: false,
    correctCount: 0,
    wrongCount: 0,
    ...overrides
  });

  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [spectators, setSpectators] = useState<Player[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [isSpectator, setIsSpectator] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const syncToRegistry = useCallback((code: string, p: Player[], s: Player[], status: 'waiting' | 'playing' | 'ended') => {
    saveRoomToRegistry({
      code,
      hostId: p.find(p2 => p2.isHost)?.id || 'me',
      players: p,
      spectators: s,
      status,
      gameTime: 180
    });
  }, []);

  useEffect(() => {
    const mode = router.params.mode;
    const paramCode = router.params.code;

    if (mode === 'join' && paramCode) {
      const existing = getRoomFromRegistry(paramCode);
      if (existing) {
        if (existing.status === 'playing') {
          Taro.showToast({ title: '该房间正在游戏中，请稍后再试', icon: 'none' });
          return;
        }
        setRoomCode(existing.code);
        setPlayers(existing.players);
        setSpectators(existing.spectators);
        setIsHost(false);
        const meInRoom = existing.players.find(p => p.id === 'me');
        const meInSpec = existing.spectators.find(p => p.id === 'me');
        if (meInRoom) {
          setIsSpectator(false);
          setIsReady(meInRoom.isReady);
        } else if (meInSpec) {
          setIsSpectator(true);
          setIsReady(false);
        } else {
          const joinMe = buildMe({ isHost: false, isReady: false });
          const newPlayers = [...existing.players, joinMe];
          setPlayers(newPlayers);
          setIsSpectator(false);
          setIsReady(false);
          syncToRegistry(existing.code, newPlayers, existing.spectators, 'waiting');
        }
        Taro.showToast({ title: `已加入房间 ${paramCode}`, icon: 'success' });
        return;
      } else {
        Taro.showToast({ title: '未找到该房间，请检查口令', icon: 'none' });
        setTimeout(() => Taro.navigateBack(), 1500);
        return;
      }
    }

    const code = paramCode || generateRoomCode();
    setRoomCode(code);

    if (mode === 'quick') {
      setIsHost(false);
      const quickMe = buildMe({ isHost: false, isReady: true });
      setIsReady(true);
      const initialPlayers = [quickMe, ...mockPlayers.filter(p => !p.isSpectator).slice(0, 3)];
      setPlayers(initialPlayers);
      setSpectators(mockPlayers.filter(p => p.isSpectator));
      syncToRegistry(code, initialPlayers, mockPlayers.filter(p => p.isSpectator), 'waiting');
    } else {
      const hostMe = buildMe({ isHost: true, isReady: false });
      setIsHost(true);
      const initialPlayers = [hostMe, ...mockPlayers.filter(p => !p.isSpectator).slice(0, 3)];
      setPlayers(initialPlayers);
      setSpectators(mockPlayers.filter(p => p.isSpectator));
      syncToRegistry(code, initialPlayers, mockPlayers.filter(p => p.isSpectator), 'waiting');
    }

    console.log('[Room] 进入房间:', code, '模式:', mode);
  }, [router.params]);

  const handleCopyCode = () => {
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
    Taro.showShareMenu({ withShareTicket: true });
    setShowShareDialog(false);
    Taro.showToast({ title: '请点击右上角转发分享', icon: 'none' });
  };

  const handleShowQRCode = () => {
    setShowShareDialog(false);
    setShowQRCode(true);
  };

  const handleToggleReady = () => {
    const newReady = !isReady;
    setIsReady(newReady);
    setPlayers(prev => {
      const updated = prev.map(p => p.id === 'me' ? { ...p, isReady: newReady } : p);
      syncToRegistry(roomCode, updated, spectators, 'waiting');
      return updated;
    });
  };

  const handleStartGame = () => {
    const readyCount = players.filter(p => p.isReady).length;
    if (readyCount < 2) {
      Taro.showToast({ title: '至少2人准备才能开始', icon: 'none' });
      return;
    }
    const activePlayers = players.filter(p => !p.isSpectator);
    console.log('[Room] 开始游戏, 对战玩家:', activePlayers.length);
    syncToRegistry(roomCode, players, spectators, 'playing');
    Taro.navigateTo({
      url: `/pages/game/index?roomCode=${roomCode}&isSpectator=${isSpectator ? '1' : '0'}`
    });
  };

  const handleSpectatorMode = () => {
    if (!isSpectator) {
      Taro.showModal({
        title: '切换为观战',
        content: '观战模式下不参与对战和计分，确定切换？',
        success: (res) => {
          if (res.confirm) {
            setIsSpectator(true);
            setIsReady(false);
            const meFromPlayers = players.find(p => p.id === 'me');
            const meAsSpec: Player = { ...(meFromPlayers || buildMe()), isSpectator: true, isReady: false };
            const newPlayers = players.filter(p => p.id !== 'me');
            const newSpectators = [...spectators, meAsSpec];
            setPlayers(newPlayers);
            setSpectators(newSpectators);
            syncToRegistry(roomCode, newPlayers, newSpectators, 'waiting');
            Taro.showToast({ title: '已切换为观战模式', icon: 'none' });
          }
        }
      });
    } else {
      setIsSpectator(false);
      const meFromSpec = spectators.find(p => p.id === 'me');
      const meAsActive: Player = { ...(meFromSpec || buildMe()), isSpectator: false, isReady: false, isHost };
      const newSpectators = spectators.filter(p => p.id !== 'me');
      const newPlayers = [meAsActive, ...players];
      setSpectators(newSpectators);
      setPlayers(newPlayers);
      syncToRegistry(roomCode, newPlayers, newSpectators, 'waiting');
      Taro.showToast({ title: '已切换为对战模式', icon: 'none' });
    }
  };

  const handleLeaveRoom = () => {
    Taro.showModal({
      title: '离开房间',
      content: '确定要离开房间吗？',
      success: (res) => {
        if (res.confirm) {
          const newPlayers = players.filter(p => p.id !== 'me');
          const newSpectators = spectators.filter(p => p.id !== 'me');
          if (newPlayers.length === 0) {
            removeRoomFromRegistry(roomCode);
          } else {
            syncToRegistry(roomCode, newPlayers, newSpectators, 'waiting');
          }
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
          <View className={styles.roomStat}>
            <Text className={styles.roomStatLabel}>观战</Text>
            <Text className={styles.roomStatValue}>{spectators.length} 人</Text>
          </View>
        </View>
      </View>

      <View className={styles.shareRow}>
        <Button className={styles.shareBtn} onClick={handleShare}>📤 分享房间</Button>
        <Button className={styles.shareBtn} onClick={handleCopyCode}>🔑 复制口令</Button>
        <Button className={styles.shareBtn} onClick={handleShowQRCode}>📱 二维码</Button>
      </View>

      <View className={styles.playerSection}>
        <Text className={styles.sectionTitle}>对战玩家 ({activePlayerCount})</Text>
        <View className={styles.playerGrid}>
          {players.filter(p => !p.isSpectator).map((player) => (
            <View
              key={player.id}
              className={classNames(styles.playerCard, {
                [styles.playerReady]: player.isReady,
                [styles.playerCardMe]: player.id === 'me'
              })}
            >
              {player.isHost && <Text className={styles.hostBadge}>房主</Text>}
              {player.id === 'me' && !player.isHost && <Text className={styles.meBadge}>我</Text>}
              <Image className={styles.playerAvatar} src={player.avatar} mode="aspectFill" style={{ borderColor: player.color }} />
              <Text className={styles.playerName}>{player.name}</Text>
              <Text className={classNames(styles.playerStatus, { [styles.statusReady]: player.isReady, [styles.statusNotReady]: !player.isReady })}>
                {player.isReady ? '已准备' : '未准备'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {spectators.length > 0 && (
        <View className={styles.spectatorSection}>
          <Text className={styles.sectionTitle}>观战 ({spectators.length})</Text>
          <View className={styles.spectatorList}>
            {spectators.map((spec) => (
              <View key={spec.id} className={classNames(styles.spectatorItem, { [styles.spectatorMe]: spec.id === 'me' })}>
                <Image className={styles.spectatorAvatar} src={spec.avatar} mode="aspectFill" style={{ borderColor: spec.color }} />
                <Text className={styles.spectatorName}>{spec.name}{spec.id === 'me' ? '(我)' : ''}</Text>
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
        <Button className={styles.secondaryBtn} onClick={handleLeaveRoom}>离开</Button>
        {isHost ? (
          <Button className={classNames(styles.primaryBtn, { [styles.btnDisabled]: readyCount < 2 })} onClick={handleStartGame}>
            开始游戏 ({readyCount}人准备)
          </Button>
        ) : isSpectator ? (
          <Button className={styles.primaryBtn} onClick={handleSpectatorMode}>👀 观战中</Button>
        ) : (
          <Button className={classNames(styles.primaryBtn, { [styles.btnReady]: isReady })} onClick={handleToggleReady}>
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
              <Button className={styles.shareActionBtn} onClick={handleCopyCode}>📋 复制口令</Button>
              <Button className={styles.shareActionBtn} onClick={handleShowQRCode}>📱 二维码</Button>
              <Button className={styles.shareActionBtn} onClick={handleShareWechat}>💬 微信分享</Button>
            </View>
            <Text className={styles.shareTip}>好友可通过「加入房间」输入口令或扫码加入</Text>
            <Button className={styles.shareCloseBtn} onClick={() => setShowShareDialog(false)}>关闭</Button>
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
            <Text className={styles.shareTip}>让好友打开小程序 → 加入房间 → 扫码或输入口令</Text>
            <Button className={styles.shareCloseBtn} onClick={() => setShowQRCode(false)}>关闭</Button>
          </View>
        </View>
      )}
    </View>
  );
}
