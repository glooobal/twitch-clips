export const getYesterdayTimeRange = () => {
    const now = new Date();

    const startTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 4, 0, 0));
    const endTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 4, 0, 0));

    return {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
    };
};
