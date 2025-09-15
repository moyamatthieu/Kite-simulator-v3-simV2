/**
 * ObjectPool.ts - System de pooling d'objets pour optimiser les performances
 * Implémente les recommandations de l'agent clean-code-architect
 */

import { IObjectPool, IPoolable } from '../types/interfaces';

/**
 * Pool générique pour la réutilisation d'objets
 * Évite les allocations/désallocations fréquentes
 */
export class ObjectPool<T extends IPoolable<T>> implements IObjectPool<T> {
    private available: T[] = [];
    private active = new Set<T>();
    private factory: () => T;
    private maxSize: number;

    constructor(factory: () => T, initialSize: number = 10, maxSize: number = 100) {
        this.factory = factory;
        this.maxSize = maxSize;

        // Pré-remplir le pool
        for (let i = 0; i < initialSize; i++) {
            const obj = this.factory();
            this.available.push(obj);
        }
    }

    /**
     * Implémente IObjectPool.get() - Acquiert un objet du pool
     */
    public get(): T {
        return this.acquire();
    }

    /**
     * Acquiert un objet du pool
     */
    public acquire(config?: any): T {
        let obj = this.available.pop();

        if (!obj) {
            obj = this.factory();
            console.log(`🏭 ObjectPool: Nouvel objet créé (pool vide)`);
        }

        if (config && obj.reconfigure) {
            obj.reconfigure(config);
        }

        this.active.add(obj);
        return obj;
    }

    /**
     * Remet un objet dans le pool
     */
    public release(obj: T): void {
        if (!this.active.has(obj)) {
            console.warn('🚫 Tentative de libération d\'un objet non actif');
            return;
        }

        this.active.delete(obj);
        obj.reset();

        // Limiter la taille du pool
        if (this.available.length < this.maxSize) {
            this.available.push(obj);
        } else {
            // Laisser l'objet être collecté par le garbage collector
            console.log(`🗑️ ObjectPool: Objet rejeté (pool plein)`);
        }
    }

    /**
     * Taille totale du pool
     */
    public size(): number {
        return this.available.length;
    }

    /**
     * Nombre d'objets actifs
     */
    public activeCount(): number {
        return this.active.size;
    }

    /**
     * Statistiques du pool
     */
    public getStats(): { available: number; active: number; total: number } {
        return {
            available: this.available.length,
            active: this.active.size,
            total: this.available.length + this.active.size
        };
    }

    /**
     * Nettoyage complet du pool (alias pour dispose)
     */
    public clear(): void {
        this.dispose();
    }

    /**
     * Nettoyage complet du pool
     */
    public dispose(): void {
        this.available.length = 0;
        this.active.clear();
    }
}

/**
 * Pool spécialisé pour les labels temporaires
 */
export class LabelPool {
    private static instance: ObjectPool<any> | null = null;

    public static getInstance(): ObjectPool<any> {
        if (!this.instance) {
            // Import dynamique pour éviter la dépendance circulaire
            const createLabel = async () => {
                const { C_label } = await import('../class/C_label');
                return new C_label();
            };

            // Pour l'instant, créons un placeholder
            this.instance = new ObjectPool(() => ({} as any), 5, 20);
        }
        return this.instance;
    }
}

/**
 * Pool manager global pour tous les types d'objets
 */
export class PoolManager {
    private static pools = new Map<string, ObjectPool<any>>();

    public static getPool<T extends IPoolable<T>>(
        name: string,
        factory: () => T,
        initialSize: number = 10,
        maxSize: number = 100
    ): ObjectPool<T> {
        if (!this.pools.has(name)) {
            this.pools.set(name, new ObjectPool(factory, initialSize, maxSize));
        }
        return this.pools.get(name)!;
    }

    public static getStats(): Record<string, any> {
        const stats: Record<string, any> = {};
        this.pools.forEach((pool, name) => {
            stats[name] = pool.getStats();
        });
        return stats;
    }

    public static dispose(): void {
        this.pools.forEach(pool => pool.dispose());
        this.pools.clear();
    }
}

export default ObjectPool;