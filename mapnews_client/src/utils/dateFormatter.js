export const formatDate = (dateString) => {
    if (!dateString) return '12:00';

    const date = new Date(dateString);
    const now = new Date();

    // Сравниваем по UTC-дате чтобы не было сдвига
    const dateDay  = date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
    const todayDay = now.getUTCFullYear()  * 10000 + (now.getUTCMonth()  + 1) * 100 + now.getUTCDate();
    const yesterdayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    const yesterdayDay  = yesterdayDate.getUTCFullYear() * 10000 + (yesterdayDate.getUTCMonth() + 1) * 100 + yesterdayDate.getUTCDate();

    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    const time = `${hh}:${mm}`;

    const dd = String(date.getUTCDate()).padStart(2, '0');
    const mo = String(date.getUTCMonth() + 1).padStart(2, '0');

    if (dateDay === todayDay)     return `Сегодня ${time}`;
    if (dateDay === yesterdayDay) return `Вчера ${time}`;
    return `${dd}.${mo} ${time}`;
};