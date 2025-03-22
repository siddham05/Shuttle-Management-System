// Haversine formula to calculate distance between two points on Earth
export function calculateDistance(
  lat1: number | null | undefined,
  lon1: number | null | undefined,
  lat2: number | null | undefined,
  lon2: number | null | undefined
): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(2));
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateRouteDistance(stops: Array<{ latitude: number | null | undefined; longitude: number | null | undefined }>): number | null {
  if (!stops || stops.length < 2) {
    return null;
  }

  let totalDistance = 0;
  
  for (let i = 0; i < stops.length - 1; i++) {
    const distance = calculateDistance(
      stops[i].latitude,
      stops[i].longitude,
      stops[i + 1].latitude,
      stops[i + 1].longitude
    );

    if (distance === null) {
      return null;
    }

    totalDistance += distance;
  }
  
  return parseFloat(totalDistance.toFixed(2));
}

interface Stop {
  id: string;
  latitude: number;
  longitude: number;
}

interface Route {
  id: string;
  stops: Stop[];
  estimated_time: number;
}

interface TransferPoint {
  id: string;
  stop_id: string;
  wait_time: number;
}

interface RouteWithTransfer {
  firstRoute: Route;
  secondRoute: Route;
  transferPoint: Stop;
  totalTime: number;
  totalDistance: number;
  waitTime: number;
}

export function findOptimalTransferRoute(
  routes: Route[],
  fromStop: Stop,
  toStop: Stop,
  transferPoints: TransferPoint[]
): RouteWithTransfer | null {
  let bestTransferRoute: RouteWithTransfer | null = null;
  let minTotalTime = Infinity;

  // Find routes that contain the transfer points
  for (const transferPoint of transferPoints) {
    const transferStop = routes
      .flatMap(r => r.stops)
      .find(s => s.id === transferPoint.stop_id);

    if (!transferStop) continue;

    // Find routes from start to transfer point
    const possibleFirstRoutes = routes.filter(route => 
      route.stops.some(s => s.id === fromStop.id) &&
      route.stops.some(s => s.id === transferPoint.stop_id)
    );

    // Find routes from transfer point to destination
    const possibleSecondRoutes = routes.filter(route => 
      route.stops.some(s => s.id === transferPoint.stop_id) &&
      route.stops.some(s => s.id === toStop.id)
    );

    // Check all possible combinations
    for (const firstRoute of possibleFirstRoutes) {
      for (const secondRoute of possibleSecondRoutes) {
        // Calculate total time including transfer wait time
        const totalTime = 
          firstRoute.estimated_time + 
          secondRoute.estimated_time + 
          transferPoint.wait_time;

        // Calculate total distance
        const firstRouteDistance = calculateRouteDistance(firstRoute.stops) || 0;
        const secondRouteDistance = calculateRouteDistance(secondRoute.stops) || 0;
        const totalDistance = firstRouteDistance + secondRouteDistance;

        // Update best route if this is faster
        if (totalTime < minTotalTime) {
          minTotalTime = totalTime;
          bestTransferRoute = {
            firstRoute,
            secondRoute,
            transferPoint: transferStop,
            totalTime,
            totalDistance,
            waitTime: transferPoint.wait_time
          };
        }
      }
    }
  }

  return bestTransferRoute;
}

export function findBestRoute(
  routes: Route[],
  fromStop: Stop,
  toStop: Stop,
  transferPoints: TransferPoint[]
): { direct: Route | null; transfer: RouteWithTransfer | null } {
  // Find direct route
  const directRoute = routes.find(route => {
    const fromIndex = route.stops.findIndex(s => s.id === fromStop.id);
    const toIndex = route.stops.findIndex(s => s.id === toStop.id);
    return fromIndex !== -1 && toIndex !== -1;
  });

  // Find transfer route
  const transferRoute = findOptimalTransferRoute(routes, fromStop, toStop, transferPoints);

  return {
    direct: directRoute,
    transfer: transferRoute
  };
}