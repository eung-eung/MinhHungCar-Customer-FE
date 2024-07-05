export default function convertICTToUTC (nowDate: Date) {
    const ictOffset = 7 * 3600; // UTC+7 for Indochina Time (ICT)
    const utcDate = new Date(nowDate.getTime() - ictOffset  * 1000);
    return utcDate;
};
