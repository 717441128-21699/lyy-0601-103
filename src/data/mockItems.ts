import { Item } from '@/types/game';

export const mockItems: Item[] = [
  {
    id: 'item-1',
    name: '干扰弹',
    description: '对指定玩家释放，使其屏幕闪烁1秒',
    icon: '💣',
    type: 'interfere',
    price: 50,
    count: 3
  },
  {
    id: 'item-2',
    name: '迷雾弹',
    description: '使所有其他玩家视野模糊2秒',
    icon: '🌫️',
    type: 'interfere',
    price: 80,
    count: 2
  },
  {
    id: 'item-3',
    name: '临时护盾',
    description: '保护自己免受下一次道具干扰',
    icon: '🛡️',
    type: 'shield',
    price: 60,
    count: 2
  },
  {
    id: 'item-4',
    name: '双倍积分卡',
    description: '接下来3题得分翻倍',
    icon: '✨',
    type: 'bonus',
    price: 100,
    count: 1
  },
  {
    id: 'item-5',
    name: '点赞',
    description: '给对手一个赞的表情',
    icon: '👍',
    type: 'emoji',
    price: 10,
    count: 10
  },
  {
    id: 'item-6',
    name: '生气',
    description: '发送生气表情',
    icon: '😠',
    type: 'emoji',
    price: 10,
    count: 10
  },
  {
    id: 'item-7',
    name: '大笑',
    description: '发送大笑表情',
    icon: '😂',
    type: 'emoji',
    price: 10,
    count: 10
  },
  {
    id: 'item-8',
    name: '加油',
    description: '发送加油表情',
    icon: '💪',
    type: 'emoji',
    price: 10,
    count: 10
  }
];

export const shopItems: Item[] = [
  {
    id: 'shop-1',
    name: '干扰弹',
    description: '对指定玩家释放，使其屏幕闪烁1秒',
    icon: '💣',
    type: 'interfere',
    price: 50
  },
  {
    id: 'shop-2',
    name: '迷雾弹',
    description: '使所有其他玩家视野模糊2秒',
    icon: '🌫️',
    type: 'interfere',
    price: 80
  },
  {
    id: 'shop-3',
    name: '临时护盾',
    description: '保护自己免受下一次道具干扰',
    icon: '🛡️',
    type: 'shield',
    price: 60
  },
  {
    id: 'shop-4',
    name: '双倍积分卡',
    description: '接下来3题得分翻倍',
    icon: '✨',
    type: 'bonus',
    price: 100
  },
  {
    id: 'shop-5',
    name: '表情礼包',
    description: '包含5种常用表情各5个',
    icon: '🎁',
    type: 'emoji',
    price: 100
  },
  {
    id: 'shop-6',
    name: '超级道具包',
    description: '包含各类道具超值组合',
    icon: '💎',
    type: 'bonus',
    price: 300
  }
];
