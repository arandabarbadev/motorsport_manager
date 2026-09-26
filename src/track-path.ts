// ============================================================
// TRACK PATH SAMPLER (Phase 2)
// Turns the sparse Track.path control points into a smooth closed
// Catmull-Rom spline and maps lapProgress (0..1) to an (x, y)
// point on it, with arc-length parametrization so equal steps of
// lapProgress mean equal distance travelled.
// Pure math: no Canvas, no DOM.
// ============================================================

export interface Point {
  x: number;
  y: number;
}

export interface TrackSampler {
  // Position along the lap at fraction t (0..1) of total lap distance.
  pointAt(t: number): Point;
  // Dense polyline of the closed loop for drawing.
  polyline(): Point[];
}

// Catmull-Rom interpolation between p1 and p2 with neighbors p0 and p3.
function catmullRom(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

export function buildTrackSampler(
  controlPoints: Point[],
  samplesPerSegment = 24
): TrackSampler {
  const n = controlPoints.length;
  const points: Point[] = [];
  for (let i = 0; i < n; i++) {
    const p0 = controlPoints[(i - 1 + n) % n];
    const p1 = controlPoints[i];
    const p2 = controlPoints[(i + 1) % n];
    const p3 = controlPoints[(i + 2) % n];
    for (let s = 0; s < samplesPerSegment; s++) {
      points.push(catmullRom(p0, p1, p2, p3, s / samplesPerSegment));
    }
  }

  // Cumulative arc length (the last entry closes the loop back to start).
  const cum: number[] = [0];
  for (let i = 1; i <= points.length; i++) {
    const a = points[i - 1];
    const b = points[i % points.length];
    cum.push(cum[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const total = cum[points.length];

  return {
    pointAt(t: number): Point {
      const tt = ((t % 1) + 1) % 1; // wrap any value into 0..1
      const target = tt * total;
      // Binary search: first cumulative entry greater than target.
      let lo = 0;
      let hi = points.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] <= target) lo = mid + 1;
        else hi = mid;
      }
      const i = Math.max(1, lo);
      const a = points[i - 1];
      const b = points[i % points.length];
      const segLen = cum[i] - cum[i - 1];
      const f = segLen > 0 ? (target - cum[i - 1]) / segLen : 0;
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    },
    polyline(): Point[] {
      return points;
    },
  };
}
