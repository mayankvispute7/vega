// lib/data/operators.ts — Simulated operators for Pune corridor (SIMULATED DATA)
import type { Operator } from '@/lib/types';

export const OPERATORS: Operator[] = [
  {
    id: 'OP-001',
    name: 'Ravi Kumar',
    junctionId: 'J1',
    role: 'operator',
    behaviour: 'fast',
    phone: '+91-98XXX-XXXXX',
  },
  {
    id: 'OP-002',
    name: 'Suresh Patil',
    junctionId: 'J2',
    role: 'operator',
    behaviour: 'slow',
    phone: '+91-98XXX-XXXXX',
  },
  {
    id: 'OP-003',
    name: 'Anita Deshmukh',
    junctionId: 'J3',
    role: 'operator',
    behaviour: 'responsive',
    phone: '+91-98XXX-XXXXX',
  },
  {
    id: 'OP-004',
    name: 'Priya Joshi',
    junctionId: 'J4',
    role: 'operator',
    behaviour: 'decision-support',
    phone: '+91-98XXX-XXXXX',
  },
  {
    id: 'OP-005',
    name: 'Mohan Shinde',
    junctionId: 'J5',
    role: 'operator',
    behaviour: 'fast',
    phone: '+91-98XXX-XXXXX',
  },
  {
    id: 'SUP-001',
    name: 'Kavita Mehta',
    junctionId: 'J2',
    role: 'supervisor',
    behaviour: 'responsive',
    phone: '+91-98XXX-XXXXX',
  },
];

export const SUPERVISOR = OPERATORS.find(o => o.role === 'supervisor')!;

export function getOperatorByJunction(junctionId: string): Operator | undefined {
  return OPERATORS.find(o => o.junctionId === junctionId && o.role === 'operator');
}

export function getOperatorById(id: string): Operator | undefined {
  return OPERATORS.find(o => o.id === id);
}
