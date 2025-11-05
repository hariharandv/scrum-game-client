// Role-based permissions for the Scrum game
import type { PlayerRole, BoardColumn, GamePhase } from '../types/game';

/**
 * Maps player roles to the columns they are responsible for
 */
export const ROLE_COLUMN_MAP: Record<PlayerRole, BoardColumn[]> = {
  'Stakeholder': ['Funnel'],
  'ProductOwner': ['ProductBacklog'],
  'ScrumMaster': ['SprintBacklog'],
  'Developer-Impl': ['Implementation'],
  'Developer-Intg': ['Integration'],
  'QATester': ['Testing'],
  'ReleaseManager': ['PreDeployment'],
  'Customer': ['Production']
};

/**
 * Maps columns to the roles responsible for them
 */
export const COLUMN_ROLE_MAP: Record<BoardColumn, PlayerRole> = {
  'Funnel': 'Stakeholder',
  'ProductBacklog': 'ProductOwner',
  'SprintBacklog': 'ScrumMaster',
  'Implementation': 'Developer-Impl',
  'Integration': 'Developer-Intg',
  'Testing': 'QATester',
  'PreDeployment': 'ReleaseManager',
  'Production': 'Customer'
};

/**
 * Defines which roles can move cards from which columns
 */
export const canMoveCardFromColumn = (role: PlayerRole, column: BoardColumn): boolean => {
  const responsibleColumns = ROLE_COLUMN_MAP[role];
  return responsibleColumns.includes(column);
};

/**
 * Defines which roles can move cards to which columns
 */
export const canMoveCardToColumn = (role: PlayerRole, fromColumn: BoardColumn, toColumn: BoardColumn): boolean => {
  // Check if the current role is responsible for the source column
  if (!canMoveCardFromColumn(role, fromColumn)) {
    return false;
  }

  // Get the column index to ensure sequential movement
  const columnOrder: BoardColumn[] = [
    'Funnel',
    'ProductBacklog',
    'SprintBacklog',
    'Implementation',
    'Integration',
    'Testing',
    'PreDeployment',
    'Production'
  ];

  const fromIndex = columnOrder.indexOf(fromColumn);
  const toIndex = columnOrder.indexOf(toColumn);

  // Can only move to the next column (or Production on dice roll 1)
  return toIndex === fromIndex + 1 || toColumn === 'Production';
};

/**
 * Checks if a role can roll dice for cards in a specific column
 */
export const canRollDice = (role: PlayerRole, column: BoardColumn, phase: GamePhase): boolean => {
  // Only during Execution phase
  if (phase !== 'Execution') {
    return false;
  }

  // Only Developer-Impl, Developer-Intg, QATester, and ReleaseManager can roll dice
  const diceRollingRoles: PlayerRole[] = ['Developer-Impl', 'Developer-Intg', 'QATester', 'ReleaseManager'];
  
  if (!diceRollingRoles.includes(role)) {
    return false;
  }

  // Only for cards in Implementation, Integration, Testing, or PreDeployment
  const diceColumns: BoardColumn[] = ['Implementation', 'Integration', 'Testing', 'PreDeployment'];
  
  return diceColumns.includes(column) && ROLE_COLUMN_MAP[role].includes(column);
};

/**
 * Get the target column for a card after a dice roll
 */
export const getTargetColumnAfterDiceRoll = (diceRoll: number, currentColumn: BoardColumn): BoardColumn => {
  const columnOrder: BoardColumn[] = [
    'Funnel',
    'ProductBacklog',
    'SprintBacklog',
    'Implementation',
    'Integration',
    'Testing',
    'PreDeployment',
    'Production'
  ];

  const currentIndex = columnOrder.indexOf(currentColumn);

  switch (diceRoll) {
    case 1:
      // Critical Success - Go directly to Production
      return 'Production';
    case 2:
    case 3:
      // Standard Progress - Move to next column
      return columnOrder[currentIndex + 1] || currentColumn;
    case 4:
      // Scope Creep - Back to Product Backlog
      return 'ProductBacklog';
    case 5:
      // Technical Impediment - Back to Implementation
      return 'Implementation';
    case 6:
      // Critical Failure - Back to Sprint Backlog
      return 'SprintBacklog';
    default:
      return currentColumn;
  }
};

/**
 * Get the description of a dice roll outcome
 */
export const getDiceRollDescription = (diceRoll: number): string => {
  switch (diceRoll) {
    case 1:
      return '🎉 Critical Success! Card moves directly to Production';
    case 2:
    case 3:
      return '✅ Standard Progress - Card moves to next column';
    case 4:
      return '⚠️ Scope Creep - Card returns to Product Backlog';
    case 5:
      return '🔧 Technical Impediment - Card returns to Implementation';
    case 6:
      return '❌ Critical Failure - Card returns to Sprint Backlog';
    default:
      return 'Invalid dice roll';
  }
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: PlayerRole): string => {
  const names: Record<PlayerRole, string> = {
    'Stakeholder': 'Stakeholder/BA',
    'ProductOwner': 'Product Owner',
    'ScrumMaster': 'Scrum Master',
    'Developer-Impl': 'Developer (Implementation)',
    'Developer-Intg': 'Developer (Integration)',
    'QATester': 'QA Tester',
    'ReleaseManager': 'Release Manager',
    'Customer': 'Customer'
  };
  return names[role];
};

/**
 * Get the next role in turn order
 */
export const getNextRole = (currentRole: PlayerRole): PlayerRole => {
  const roleOrder: PlayerRole[] = [
    'Stakeholder',
    'ProductOwner',
    'ScrumMaster',
    'Developer-Impl',
    'Developer-Intg',
    'QATester',
    'ReleaseManager',
    'Customer'
  ];

  const currentIndex = roleOrder.indexOf(currentRole);
  const nextIndex = (currentIndex + 1) % roleOrder.length;
  return roleOrder[nextIndex];
};
