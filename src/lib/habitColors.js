export const HABIT_COLORS = [
    '#748165', // sage (original thread)
    '#C17B3E', // amber
    '#6B8A9E', // dusty blue
    '#92718F', // plum
    '#B5654F', // terracotta
    '#5C8A6B', // teal-green
    '#A68A3E', // ochre
    '#6E6FA0', // indigo
    '#3E7C8C', // deep teal
    '#A8556B', // berry
  ]
  
  export function colorForIndex(i) {
    return HABIT_COLORS[i % HABIT_COLORS.length]
  }