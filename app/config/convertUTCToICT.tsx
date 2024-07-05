export default function convertUTCToICT (nowDate: Date) {
    const ictOffset = 7 * 3600;
    const ictDate = new Date(nowDate.getTime() + ictOffset  * 1000);
    return ictDate;
};