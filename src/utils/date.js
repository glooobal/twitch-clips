export const getYesterdayTimeRange = () => {
    const now = new Date();

    const startTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 4, 0, 0));
    const endTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 4, 0, 0));

    return {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
    };
};

export const getLastWeekTimeRange = () => {
    const now = new Date();

    const daysSinceMonday = (now.getUTCDay() + 6) % 7;

    const lastMonday = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday - 7, 4, 0, 0)
    );

    const thisMonday = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday, 4, 0, 0)
    );

    return {
        start: lastMonday.toISOString(),
        end: thisMonday.toISOString(),
    };
};
