export const formatDate = (dateString) => {
    if (!dateString) return '12:00';

    const date = new Date(dateString);
    const now = new Date();

    const dateDay      = date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
    const todayDay     = now.getUTCFullYear()  * 10000 + (now.getUTCMonth()  + 1) * 100 + now.getUTCDate();
    const yest         = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    const yesterdayDay = yest.getUTCFullYear() * 10000 + (yest.getUTCMonth() + 1) * 100 + yest.getUTCDate();

    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const mo = String(date.getUTCMonth() + 1).padStart(2, '0');

    if (dateDay === todayDay)     return `Сегодня ${hh}:${mm}`;
    if (dateDay === yesterdayDay) return `Вчера ${hh}:${mm}`;
    return `${dd}.${mo} ${hh}:${mm}`;
};