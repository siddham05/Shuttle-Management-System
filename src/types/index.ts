export interface User {
  id: string;
  email: string;
  role: 'admin' | 'student';
  points: number;
  created_at: string;
}

export interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface StopWithDistance extends Stop {
  distance: number | null;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  stops: Stop[];
  peak_hours: string[];
  estimated_time: number;
}

export interface TransferPoint {
  id: string;
  stop_id: string;
  name: string;
  wait_time: number;
  created_at: string;
}

export interface RouteWithTransfer {
  firstRoute: Route;
  secondRoute: Route;
  transferPoint: Stop;
  totalTime: number;
  totalDistance: number;
  waitTime: number;
}

export interface Booking {
  id: string;
  user_id: string;
  route_id: string;
  start_stop_id: string;
  end_stop_id: string;
  points_deducted: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  scheduled_time: string;
  transfer_point_id?: string;
  second_route_id?: string;
  total_wait_time?: number;
}