import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockItems, shopItems } from '@/data/mockItems';
import classNames from 'classnames';

type TabType = 'backpack' | 'shop';

export default function ItemPage() {
  const [activeTab, setActiveTab] = useState<TabType>('backpack');
  const [coins, setCoins] = useState(1250);
  const [myItems, setMyItems] = useState(mockItems);

  const handleBuyItem = (itemId: string, price: number, name: string) => {
    console.log('[Item] 购买道具:', itemId, price);
    if (coins < price) {
      Taro.showToast({
        title: '积分不足',
        icon: 'none'
      });
      return;
    }

    Taro.showModal({
      title: '购买确认',
      content: `确定花费 ${price} 积分购买 ${name} 吗？`,
      success: (res) => {
        if (res.confirm) {
          setCoins(coins - price);
          setMyItems((prev) => {
            const existing = prev.find((i) => i.id === itemId);
            if (existing) {
              return prev.map((i) =>
                i.id === itemId ? { ...i, count: (i.count || 0) + 1 } : i
              );
            }
            return prev;
          });
          Taro.showToast({
            title: '购买成功',
            icon: 'success'
          });
        }
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
                  {item.count !== undefined && item.count > 0 && (
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
                  onClick={() => handleBuyItem(item.id, item.price, item.name)}
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
