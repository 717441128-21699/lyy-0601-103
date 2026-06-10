import React, { useState, useCallback } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { shopItems } from '@/data/mockItems';
import { getMyCoins, saveMyCoins, getMyItems, saveMyItems } from '@/utils/globalState';
import classNames from 'classnames';
import type { Item } from '@/types/game';

type TabType = 'backpack' | 'shop';

const BUNDLE_CONTENTS: Record<string, Partial<Item>[]> = {
  'shop-5': [
    { name: '点赞', icon: '👍', type: 'emoji', description: '给对手一个赞的表情' },
    { name: '生气', icon: '😠', type: 'emoji', description: '发送生气表情' },
    { name: '大笑', icon: '😂', type: 'emoji', description: '发送大笑表情' },
    { name: '加油', icon: '💪', type: 'emoji', description: '发送加油表情' },
    { name: '庆祝', icon: '🎉', type: 'emoji', description: '发送庆祝表情' },
  ],
  'shop-6': [
    { name: '干扰弹', icon: '💣', type: 'interfere', description: '对指定玩家释放，使其屏幕闪烁1秒' },
    { name: '迷雾弹', icon: '🌫️', type: 'interfere', description: '使所有其他玩家视野模糊2秒' },
    { name: '临时护盾', icon: '🛡️', type: 'shield', description: '保护自己免受下一次道具干扰' },
  ],
};

export default function ItemPage() {
  const [activeTab, setActiveTab] = useState<TabType>('backpack');
  const [coins, setCoins] = useState(getMyCoins);
  const [myItems, setMyItems] = useState<Item[]>(getMyItems);

  const persistState = useCallback((newCoins: number, newItems: Item[]) => {
    setCoins(newCoins);
    setMyItems(newItems);
    saveMyCoins(newCoins);
    saveMyItems(newItems);
  }, []);

  const findOrMatchItem = (items: Item[], targetName: string): Item | undefined => {
    return items.find(i => i.name === targetName);
  };

  const handleBuyItem = (shopItem: Item) => {
    const { id, price, name } = shopItem;
    console.log('[Item] 购买道具:', id, price);

    if (coins < price) {
      Taro.showToast({ title: '积分不足', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '购买确认',
      content: `确定花费 ${price} 积分购买 ${name} 吗？`,
      success: (res) => {
        if (!res.confirm) return;

        const newCoins = coins - price;
        let newItems = [...myItems];

        const bundleContents = BUNDLE_CONTENTS[id];
        if (bundleContents) {
          bundleContents.forEach(bundleItem => {
            const existing = findOrMatchItem(newItems, bundleItem.name!);
            if (existing) {
              newItems = newItems.map(i =>
                i.name === bundleItem.name ? { ...i, count: (i.count || 0) + 5 } : i
              );
            } else {
              newItems.push({
                id: `item-${bundleItem.name}-${Date.now()}`,
                name: bundleItem.name!,
                description: bundleItem.description!,
                icon: bundleItem.icon!,
                type: bundleItem.type as Item['type'],
                price: 0,
                count: 5
              });
            }
          });
        } else {
          const existing = findOrMatchItem(newItems, name);
          if (existing) {
            newItems = newItems.map(i =>
              i.name === name ? { ...i, count: (i.count || 0) + 1 } : i
            );
          } else {
            newItems.push({
              ...shopItem,
              id: `item-${name}-${Date.now()}`,
              count: 1
            });
          }
        }

        persistState(newCoins, newItems);
        Taro.showToast({ title: '购买成功', icon: 'success' });
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.coinCard}>
        <View className={styles.coinInfo}>
          <Text className={styles.coinLabel}>我的积分</Text>
          <Text className={styles.coinAmount}>{coins.toLocaleString()}</Text>
        </View>
        <Text className={styles.coinIcon}>💰</Text>
      </View>

      <View className={styles.tabs}>
        <Text
          className={classNames(styles.tabItem, {
            [styles.tabActive]: activeTab === 'backpack'
          })}
          onClick={() => setActiveTab('backpack')}
        >
          我的道具
        </Text>
        <Text
          className={classNames(styles.tabItem, {
            [styles.tabActive]: activeTab === 'shop'
          })}
          onClick={() => setActiveTab('shop')}
        >
          道具商店
        </Text>
      </View>

      {activeTab === 'backpack' ? (
        <View>
          <Text className={styles.sectionTitle}>道具背包</Text>
          {myItems.length > 0 ? (
            <View className={styles.itemGrid}>
              {myItems.map((item) => (
                <View key={item.id} className={styles.itemCard}>
                  {(item.count !== undefined && item.count > 0) && (
                    <Text className={styles.itemCount}>×{item.count}</Text>
                  )}
                  <Text className={styles.itemIcon}>{item.icon}</Text>
                  <View className={styles.itemInfo}>
                    <Text className={styles.itemName}>{item.name}</Text>
                    <Text className={styles.itemDesc}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className={styles.emptyState}>暂无道具，去商店看看吧~</Text>
          )}
        </View>
      ) : (
        <View>
          <Text className={styles.sectionTitle}>热门道具</Text>
          <View className={styles.itemGrid}>
            {shopItems.map((item) => (
              <View key={item.id} className={styles.itemCard}>
                <Text className={styles.itemIcon}>{item.icon}</Text>
                <View className={styles.itemInfo}>
                  <Text className={styles.itemName}>{item.name}</Text>
                  <Text className={styles.itemDesc}>{item.description}</Text>
                </View>
                <Text className={styles.itemPrice}>
                  💰 {item.price}
                </Text>
                <Button
                  className={classNames(styles.buyBtn, {
                    [styles.buyBtnDisabled]: coins < item.price
                  })}
                  onClick={() => handleBuyItem(item)}
                >
                  购买
                </Button>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
