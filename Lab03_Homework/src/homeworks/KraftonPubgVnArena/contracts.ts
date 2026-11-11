// KRAFTON x PUBG VIETNAM ARENA – domain contract (types only, erased at build time).
export type DropPhase = 'WARMUP' | 'AIRDROP_LIVE' | 'LOOTED_OUT' | 'EXPIRED';

export interface PubgCrateDrop {
  readonly id: string;
  readonly title: string;          // e.g. 'PVS Finals VIP Pass + 5,000 G-Coin'
  readonly priceVnd: number;       // formatted via Intl.NumberFormat('vi-VN')
  readonly remainingStock: number;
  readonly dropEpochMs: number;
}

export interface PubgVnSquadStanding {
  readonly squadId: string;        // 'te' | 'ces' | 'roy' | 'agg'
  readonly squadName: string;
  readonly wwcdCount: number;      // Winner Winner Chicken Dinner!
  readonly placementPts: number;
  readonly killPts: number;
}

export interface KillFeedEvent {
  readonly id: string;
  readonly squadId: string;
  readonly text: string;
  readonly atMs: number;
}

export type ClaimStatus = 'IDLE' | 'IN_FLIGHT' | 'CLAIMED' | 'CONFLICT';
