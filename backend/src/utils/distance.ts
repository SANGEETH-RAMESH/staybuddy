export function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
    const y = lat2 - lat1;
    const kmPerDegree = 111;

    return Math.sqrt(x * x + y * y) * kmPerDegree;
}