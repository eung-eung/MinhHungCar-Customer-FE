export default function convertUTCToICT(nowDate: Date) {
    const ictOffset = 7 * 3600; // UTC+7 for Indochina Time (ICT)
    const ictDate = new Date(nowDate.getTime() + ictOffset * 1000);
    return ictDate;
}
