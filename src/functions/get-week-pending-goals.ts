import dayjs from 'dayjs'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'

export async function getWeekPendingGoals() {
    const firstDayOfWeek = dayjs().startOf('week').toDate()
    const lastDayOfWeek = dayjs().endOf('week').toDate()

    const goalsCreatedUpToWeak = db.$with('goals_created_up_to_weak').as(
        db
            .select({
                id: goals.id,
                title: goals.title,
                desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
                createdAt: goals.createdAt,
            })
            .from(goals)
            .where(lte(goals.createdAt, lastDayOfWeek))
    )

    const goalCompletionCounts = db.$with('goal_completion_counts').as(
        db
            .select({
                goalId: goalCompletions.goalId,
                completionCount: count(goalCompletions.id).as(
                    'completionCount'
                ),
            })
            .from(goalCompletions)
            .where(
                and(
                    gte(goalCompletions.createdAt, firstDayOfWeek),
                    lte(goalCompletions.createdAt, lastDayOfWeek)
                )
            )
            .groupBy(goalCompletions.goalId)
    )

    const pendingGoals = await db
        .with(goalsCreatedUpToWeak, goalCompletionCounts)
        .select({
            id: goalsCreatedUpToWeak.id,
            title: goalsCreatedUpToWeak.title,
            desiredWeeklyFrequency: goalsCreatedUpToWeak.desiredWeeklyFrequency,
            completionCount: sql`
            COALESCE(${goalCompletionCounts.completionCount}, 0)
            `.mapWith(Number),
        })
        .from(goalsCreatedUpToWeak)
        .leftJoin(
            goalCompletionCounts,
            eq(goalCompletionCounts.goalId, goalsCreatedUpToWeak.id)
        )

    return { pendingGoals }
}
