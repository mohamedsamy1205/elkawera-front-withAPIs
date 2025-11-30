import { Player, Position, PhysicalStats } from '../types';

export const computeOverall = (stats: PhysicalStats, position: Position): number => {
  // Weights based on position
  let weights: Partial<Record<keyof PhysicalStats, number>> = {};

  switch (position) {
    case 'ST':
    case 'CF':
      weights = { shooting: 0.25, pace: 0.15, dribbling: 0.15, physical: 0.15, passing: 0.05, acceleration: 0.1, agility: 0.1, stamina: 0.05 };
      break;
    
    case 'LW':
    case 'RW':
    case 'LM':
    case 'RM':
      weights = { pace: 0.20, dribbling: 0.20, passing: 0.15, shooting: 0.15, acceleration: 0.1, agility: 0.1, stamina: 0.1 };
      break;
    
    case 'CAM':
      weights = { passing: 0.25, dribbling: 0.25, shooting: 0.15, agility: 0.15, pace: 0.1, stamina: 0.1 };
      break;

    case 'CM':
      weights = { passing: 0.25, dribbling: 0.15, stamina: 0.15, defending: 0.1, shooting: 0.1, physical: 0.15, agility: 0.1 };
      break;

    case 'CDM':
      weights = { defending: 0.25, physical: 0.2, passing: 0.15, stamina: 0.15, pace: 0.1, dribbling: 0.1, acceleration: 0.05 };
      break;

    case 'LB':
    case 'RB':
    case 'LWB':
    case 'RWB':
      weights = { pace: 0.20, defending: 0.20, stamina: 0.15, passing: 0.15, dribbling: 0.1, physical: 0.1, acceleration: 0.1 };
      break;

    case 'CB':
      weights = { defending: 0.35, physical: 0.3, pace: 0.1, passing: 0.1, stamina: 0.1, acceleration: 0.05 };
      break;

    case 'GK':
      // For GK, we map generic stats to GK specific concepts
      // Agility -> Reflexes/Diving
      // Defending -> Positioning/Handling
      // Physical -> Strength/Aerial
      // Passing -> Kicking
      weights = { agility: 0.3, physical: 0.2, defending: 0.25, passing: 0.15, stamina: 0.1 };
      break;
      
    default:
       weights = { passing: 0.2, dribbling: 0.2, shooting: 0.2, defending: 0.2, physical: 0.2 };
  }

  let totalScore = 0;
  let totalWeight = 0;

  (Object.keys(stats) as Array<keyof PhysicalStats>).forEach((key) => {
    const weight = weights[key] || 0.01; // default low weight if not specified
    totalScore += stats[key] * weight;
    totalWeight += weight;
  });

  // Normalize if weights don't add exactly to 1 (though they should)
  return Math.round(totalScore / totalWeight); 
};

export const getCardType = (overall: number): 'Silver' | 'Gold' | 'Platinum' => {
  if (overall >= 85) return 'Platinum';
  if (overall >= 75) return 'Gold';
  return 'Silver';
};

export const computeOverallWithPerformance = (
  baseScore: number,
  goals: number,
  assists: number,
  matches: number
): number => {
  // Calculate performance bonus based on goals, assists, and matches
  // Goals and assists contribute positively, matches provide experience bonus
  
  // Goals contribution: each goal adds a small bonus (max +5 points for 50+ goals)
  const goalsBonus = Math.min(goals * 0.1, 5);
  
  // Assists contribution: each assist adds a small bonus (max +4 points for 40+ assists)
  const assistsBonus = Math.min(assists * 0.1, 4);
  
  // Matches contribution: experience bonus based on matches played (max +3 points for 50+ matches)
  const matchesBonus = Math.min(matches * 0.06, 3);
  
  // Total performance bonus
  const performanceBonus = goalsBonus + assistsBonus + matchesBonus;
  
  // Add performance bonus to base score, capped at 99
  const finalScore = Math.min(Math.round(baseScore + performanceBonus), 99);
  
  return finalScore;
};
