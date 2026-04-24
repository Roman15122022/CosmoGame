import type { Entity } from '@data/types';

export class CollisionSystem {
  static intersects(first: Entity, second: Entity) {
    const a = first.bounds;
    const b = second.bounds;

    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }
}
