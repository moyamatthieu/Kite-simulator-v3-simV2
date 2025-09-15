/**
 * interfaces.ts - Interfaces communes pour le système
 */

export interface IPoolable<T> {
  reset(): void;
  dispose?(): void;
  reconfigure?(config: any): void;
}

export interface IDisposable {
  dispose(): void;
}

export interface IUpdatable {
  update(deltaTime: number): void;
}

export interface IRenderble {
  render(): void;
}

export interface IObjectPool<T> {
  get(): T;
  release(object: T): void;
  clear(): void;
}