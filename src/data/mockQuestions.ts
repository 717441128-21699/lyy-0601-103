import { Question } from '@/types/game';

const colors = [
  { name: '红色', value: '#ef4444' },
  { name: '蓝色', value: '#3b82f6' },
  { name: '绿色', value: '#22c55e' },
  { name: '黄色', value: '#eab308' },
  { name: '紫色', value: '#a855f7' },
  { name: '青色', value: '#06b6d4' },
  { name: '橙色', value: '#f97316' },
  { name: '粉色', value: '#ec4899' }
];

const directions = [
  { name: '上', value: 'up', arrow: '↑' },
  { name: '下', value: 'down', arrow: '↓' },
  { name: '左', value: 'left', arrow: '←' },
  { name: '右', value: 'right', arrow: '→' }
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateColorQuestion(): Question {
  const shuffled = shuffleArray(colors);
  const correct = shuffled[0];
  const options = shuffled.slice(0, 4).map(c => c.name);
  
  return {
    id: `q-color-${Date.now()}`,
    type: 'color',
    content: correct.value,
    answer: correct.name,
    options: shuffleArray(options),
    color: correct.value
  };
}

export function generateNumberQuestion(): Question {
  const target = Math.floor(Math.random() * 10);
  const optionsSet = new Set<number>([target]);
  
  while (optionsSet.size < 4) {
    const num = Math.floor(Math.random() * 10);
    optionsSet.add(num);
  }
  
  return {
    id: `q-number-${Date.now()}`,
    type: 'number',
    content: target.toString(),
    answer: target.toString(),
    options: shuffleArray([...optionsSet]).map(n => n.toString())
  };
}

export function generateDirectionQuestion(): Question {
  const shuffled = shuffleArray(directions);
  const correct = shuffled[0];
  const options = shuffled.slice(0, 4).map(d => d.name);
  
  return {
    id: `q-direction-${Date.now()}`,
    type: 'direction',
    content: correct.arrow,
    answer: correct.name,
    options: shuffleArray(options),
    direction: correct.value as 'up' | 'down' | 'left' | 'right'
  };
}

export function generateRandomQuestion(): Question {
  const types: ('color' | 'number' | 'direction')[] = ['color', 'number', 'direction'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  switch (type) {
    case 'color':
      return generateColorQuestion();
    case 'number':
      return generateNumberQuestion();
    case 'direction':
      return generateDirectionQuestion();
    default:
      return generateColorQuestion();
  }
}

export const mockQuestions: Question[] = Array.from({ length: 20 }, (_, i) => {
  const types: ('color' | 'number' | 'direction')[] = ['color', 'number', 'direction'];
  const type = types[i % 3];
  
  if (type === 'color') {
    const color = colors[i % colors.length];
    return {
      id: `q-${i}`,
      type: 'color',
      content: color.value,
      answer: color.name,
      options: shuffleArray(colors.slice(0, 4).map(c => c.name)),
      color: color.value
    };
  } else if (type === 'number') {
    const num = i % 10;
    return {
      id: `q-${i}`,
      type: 'number',
      content: num.toString(),
      answer: num.toString(),
      options: shuffleArray([num, (num + 1) % 10, (num + 2) % 10, (num + 3) % 10]).map(n => n.toString())
    };
  } else {
    const dir = directions[i % directions.length];
    return {
      id: `q-${i}`,
      type: 'direction',
      content: dir.arrow,
      answer: dir.name,
      options: shuffleArray(directions.map(d => d.name)),
      direction: dir.value as 'up' | 'down' | 'left' | 'right'
    };
  }
});
