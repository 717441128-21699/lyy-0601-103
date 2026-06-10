import React, { useState } from 'react';
import { View, Text, Image, Input, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { avatarOptions, colorOptions, mockSkills } from '@/data/mockPlayers';
import { savePlayerProfile, getPlayerProfile } from '@/utils/globalState';
import classNames from 'classnames';

export default function CharacterPage() {
  const router = useRouter();
  const mode = router.params.mode || 'create';

  const savedProfile = getPlayerProfile();
  const [selectedAvatar, setSelectedAvatar] = useState(savedProfile.avatar || avatarOptions[0].url);
  const [selectedColor, setSelectedColor] = useState(savedProfile.color || colorOptions[0]);
  const [selectedSkill, setSelectedSkill] = useState(savedProfile.skill || mockSkills[0]);
  const [playerName, setPlayerName] = useState(savedProfile.name || '我');

  const handleConfirm = () => {
    console.log('[Character] 确认选择:', {
      avatar: selectedAvatar,
      color: selectedColor,
      skill: selectedSkill?.name,
      name: playerName
    });

    savePlayerProfile({
      name: playerName || '我',
      avatar: selectedAvatar,
      color: selectedColor,
      skill: selectedSkill
    });

    if (mode === 'create') {
      Taro.navigateTo({
        url: '/pages/room/index?mode=create'
      });
    } else {
      Taro.navigateBack();
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.previewCard}>
        <Image
          className={styles.previewAvatar}
          src={selectedAvatar}
          mode="aspectFill"
          style={{ borderColor: selectedColor }}
        />
        <Text className={styles.previewName}>{playerName || '我'}</Text>
        <Text className={styles.previewSkill}>
          <Text>{selectedSkill?.icon}</Text>
          <Text> {selectedSkill?.name}</Text>
        </Text>
      </View>

      <View className={styles.nameInputSection}>
        <Text className={styles.sectionTitle}>昵称</Text>
        <Input
          className={styles.nameInput}
          value={playerName}
          onInput={(e) => setPlayerName(e.detail.value)}
          placeholder="输入你的昵称"
          maxLength={10}
        />
      </View>

      <View className={styles.avatarSection}>
        <Text className={styles.sectionTitle}>选择头像</Text>
        <View className={styles.avatarGrid}>
          {avatarOptions.map((avatar) => (
            <View
              key={avatar.id}
              className={styles.avatarItem}
              onClick={() => setSelectedAvatar(avatar.url)}
            >
              <Image
                className={classNames(styles.avatarOption, {
                  [styles.avatarSelected]: selectedAvatar === avatar.url
                })}
                src={avatar.url}
                mode="aspectFill"
                style={{
                  borderColor: selectedAvatar === avatar.url ? selectedColor : 'transparent'
                }}
              />
              {selectedAvatar === avatar.url && (
                <Text className={styles.selectedCheck}>✓</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.colorSection}>
        <Text className={styles.sectionTitle}>选择代表色</Text>
        <View className={styles.colorList}>
          {colorOptions.map((color) => (
            <View
              key={color}
              className={classNames(styles.colorItem, {
                [styles.colorSelected]: selectedColor === color
              })}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            >
              {selectedColor === color && (
                <Text className={styles.colorCheck}>✓</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.skillSection}>
        <Text className={styles.sectionTitle}>选择技能</Text>
        <View className={styles.skillList}>
          {mockSkills.map((skill) => (
            <View
              key={skill.id}
              className={classNames(styles.skillCard, {
                [styles.skillCardSelected]: selectedSkill?.id === skill.id
              })}
              onClick={() => setSelectedSkill(skill)}
            >
              <Text className={styles.skillIcon}>{skill.icon}</Text>
              <View className={styles.skillInfo}>
                <Text className={styles.skillName}>{skill.name}</Text>
                <Text className={styles.skillDesc}>{skill.description}</Text>
                <Text className={styles.skillCooldown}>冷却时间: {skill.cooldown}秒</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={styles.confirmBtn}
          onClick={handleConfirm}
        >
          确认并进入房间
        </Button>
      </View>
    </View>
  );
}
