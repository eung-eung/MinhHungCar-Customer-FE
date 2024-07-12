export default function convertICTToUTC(nowDate: Date) {
    const ictOffset = 7 * 3600 * 1000; // UTC+7 for Indochina Time (ICT) in milliseconds
    const utcDate = new Date(nowDate.getTime() - ictOffset);
    return utcDate;
}
