import prisma from './prisma';
import { PointTransactionType, Prisma } from '@prisma/client';

/**
 * Loyalty points engine.
 *
 * Every movement goes through `applyPointMovement`, which updates the customer
 * balance and writes the matching ledger row inside a single transaction. No
 * route should ever write `user.points` directly, otherwise the history stops
 * explaining the balance.
 */

export class PointsError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'PointsError';
    this.status = status;
  }
}

export interface PointMovement {
  userId: string;
  /** Signed: positive credits the customer, negative debits them. */
  amount: number;
  type: PointTransactionType;
  /** Human-readable label: the service bought, or why an admin adjusted. */
  reason?: string;
  orderId?: string | null;
  /** Admin who triggered it; null for customer-initiated purchases. */
  adminId?: string | null;
}

export interface PointMovementResult {
  balanceAfter: number;
  transactionId: string;
}

/**
 * @param client pass the transaction client when the movement has to commit
 *        together with something else (e.g. creating the redeemed order).
 */
export async function applyPointMovement(
  movement: PointMovement,
  client?: Prisma.TransactionClient,
): Promise<PointMovementResult> {
  const { userId, amount, type, reason = '', orderId = null, adminId = null } = movement;

  if (!Number.isInteger(amount)) throw new PointsError('Points must be a whole number');
  if (amount === 0) throw new PointsError('Points movement cannot be zero');

  const run = async (tx: Prisma.TransactionClient): Promise<PointMovementResult> => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new PointsError('Customer not found', 404);

    if (amount < 0) {
      // Conditional update: the balance check and the debit happen in one
      // statement, so two concurrent redemptions cannot both pass it.
      const debited = await tx.user.updateMany({
        where: { id: userId, points: { gte: -amount } },
        data: { points: { increment: amount } },
      });
      if (debited.count === 0) throw new PointsError('Insufficient points');
    } else {
      await tx.user.update({ where: { id: userId }, data: { points: { increment: amount } } });
    }

    const fresh = await tx.user.findUnique({ where: { id: userId }, select: { points: true } });
    const balanceAfter = fresh?.points ?? 0;

    const transaction = await tx.pointTransaction.create({
      data: { userId, amount, balanceAfter, type, reason, orderId, adminId },
    });

    return { balanceAfter, transactionId: transaction.id };
  };

  return client ? run(client) : prisma.$transaction(run);
}

/**
 * Grants the points an admin typed when marking an order COMPLETED.
 * `order.pointsAwarded` doubles as the guard: once non-zero the award has
 * already happened and re-completing the order grants nothing.
 */
export async function awardPointsForCompletedOrder(
  orderId: string,
  points: number,
  adminId?: string | null,
): Promise<PointMovementResult | null> {
  if (!points || points <= 0) return null;
  if (!Number.isInteger(points)) throw new PointsError('Points must be a whole number');

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, pointsAwarded: true },
  });
  if (!order) throw new PointsError('Order not found', 404);
  if (order.pointsAwarded > 0) {
    throw new PointsError(`This order already granted ${order.pointsAwarded} points`, 409);
  }

  const result = await applyPointMovement({
    userId: order.userId,
    amount: points,
    type: PointTransactionType.EARNED,
    reason: 'Order completed',
    orderId: order.id,
    adminId: adminId ?? null,
  });

  await prisma.order.update({ where: { id: order.id }, data: { pointsAwarded: points } });
  return result;
}

/**
 * Gives back the points of a point-paid order that got cancelled. Safe to call
 * on any order: it is a no-op unless the order was paid with points and has not
 * been refunded yet.
 */
export async function refundPointsForCancelledOrder(
  orderId: string,
  adminId?: string | null,
): Promise<PointMovementResult | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, paidWithPoints: true, pointsSpent: true, pointsRefunded: true },
  });
  if (!order || !order.paidWithPoints || order.pointsRefunded || order.pointsSpent <= 0) return null;

  const result = await applyPointMovement({
    userId: order.userId,
    amount: order.pointsSpent,
    type: PointTransactionType.REFUNDED,
    reason: 'Point order cancelled',
    orderId: order.id,
    adminId: adminId ?? null,
  });

  await prisma.order.update({ where: { id: order.id }, data: { pointsRefunded: true } });
  return result;
}
