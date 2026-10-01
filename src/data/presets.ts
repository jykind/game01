import { RoulettePreset } from '../types';

export const VIBRANT_PALETTE = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#84CC16', // Lime
  '#E11D48', // Rose
];

export const PRESETS: RoulettePreset[] = [
  {
    id: 'food',
    title: '오늘 뭐 먹지?',
    description: '선택 장애 끝! 실패 없는 인기 점심 & 저녁 메뉴 추천',
    category: '식사',
    icon: 'Utensils',
    items: [
      { label: '삼겹살', emoji: '🥓', color: '#EF4444', weight: 1 },
      { label: '치킨', emoji: '🍗', color: '#F97316', weight: 1 },
      { label: '초밥 & 일식', emoji: '🍣', color: '#06B6D4', weight: 1 },
      { label: '짜장면 & 탕수육', emoji: '🍜', color: '#F59E0B', weight: 1 },
      { label: '피자 & 파스타', emoji: '🍕', color: '#EC4899', weight: 1 },
      { label: '김치찌개 / 백반', emoji: '🍲', color: '#10B981', weight: 1 },
      { label: '햄버거 세트', emoji: '🍔', color: '#8B5CF6', weight: 1 },
      { label: '마라탕 / 꿔바로우', emoji: '🌶️', color: '#E11D48', weight: 1 },
      { label: '떡볶이 & 분식', emoji: '🍢', color: '#3B82F6', weight: 1 },
      { label: '신선한 샐러드', emoji: '🥗', color: '#84CC16', weight: 1 },
    ],
  },
  {
    id: 'penalty',
    title: '모임 & 술자리 벌칙',
    description: '친구, 회식, 동아리 모임 분위기 띄우는 긴장감 100% 벌칙 룰렛',
    category: '파티',
    icon: 'Flame',
    items: [
      { label: '오늘 커피 쏘기', emoji: '☕', color: '#EF4444', weight: 1 },
      { label: '노래 1소절 부르기', emoji: '🎤', color: '#8B5CF6', weight: 1 },
      { label: '엉덩이로 이름쓰기', emoji: '🍑', color: '#F97316', weight: 1 },
      { label: '생존! 통과', emoji: '🎉', color: '#10B981', weight: 1 },
      { label: '편의점 간식 쏘기', emoji: '🏪', color: '#3B82F6', weight: 1 },
      { label: '딱밤 한 대 맞기', emoji: '💥', color: '#EC4899', weight: 1 },
      { label: '흑역사 1개 고백', emoji: '🤫', color: '#F59E0B', weight: 1 },
      { label: '옆 사람 칭찬 3개', emoji: '🥰', color: '#06B6D4', weight: 1 },
    ],
  },
  {
    id: 'lunch_bet',
    title: '점심값 & 커피값 내기',
    description: '누가 계산할 것인가? 운명에 맡기는 결제 배틀',
    category: '내기',
    icon: 'Coins',
    items: [
      { label: '전액 결제 당첨!', emoji: '💳', color: '#EF4444', weight: 1 },
      { label: '커피만 쏘기', emoji: '☕', color: '#F97316', weight: 1 },
      { label: '완전 무료 (축하)', emoji: '👑', color: '#10B981', weight: 1 },
      { label: '50% 반반 결제', emoji: '⚖️', color: '#3B82F6', weight: 1 },
      { label: '1,000원 할인권', emoji: '🎟️', color: '#8B5CF6', weight: 1 },
      { label: '디저트 쏘기', emoji: '🍰', color: '#EC4899', weight: 1 },
    ],
  },
  {
    id: 'order',
    title: '순서 & 역할 정하기',
    description: '발표 순서, 청소 당번, 1등 뽑기 등 공정한 무작위 추첨',
    category: '추첨',
    icon: 'ListOrdered',
    items: [
      { label: '1번 (선착순)', emoji: '🥇', color: '#EF4444', weight: 1 },
      { label: '2번 주자', emoji: '🥈', color: '#F59E0B', weight: 1 },
      { label: '3번 주자', emoji: '🥉', color: '#10B981', weight: 1 },
      { label: '4번 주자', emoji: '🎯', color: '#06B6D4', weight: 1 },
      { label: '5번 주자', emoji: '⭐', color: '#3B82F6', weight: 1 },
      { label: '6번 (마지막 피날레)', emoji: '🏁', color: '#8B5CF6', weight: 1 },
    ],
  },
  {
    id: 'decision',
    title: '갈팡질팡 Yes or No',
    description: '살까 말까? 할까 말까? 지금 결정해 드립니다',
    category: '결정',
    icon: 'HelpCircle',
    items: [
      { label: '무조건 GO!', emoji: '🚀', color: '#10B981', weight: 2 },
      { label: '지금은 참기', emoji: '🛑', color: '#EF4444', weight: 2 },
      { label: '내일 다시 생각', emoji: '⏳', color: '#F59E0B', weight: 1 },
      { label: '다른 사람에게 위임', emoji: '🙋', color: '#3B82F6', weight: 1 },
      { label: '일단 한 번 해보기', emoji: '✨', color: '#8B5CF6', weight: 1 },
    ],
  },
];
