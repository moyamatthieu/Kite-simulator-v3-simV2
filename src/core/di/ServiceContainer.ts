/**
 * ServiceContainer.ts - Container de services simple pour injection de dépendance
 */

export class ServiceContainer {
    private static instance: ServiceContainer;
    private services = new Map<string, any>();

    private constructor() {}

    public static getInstance(): ServiceContainer {
        if (!ServiceContainer.instance) {
            ServiceContainer.instance = new ServiceContainer();
        }
        return ServiceContainer.instance;
    }

    public register<T>(key: string, service: T): void {
        this.services.set(key, service);
    }

    public get<T>(key: string): T {
        const service = this.services.get(key);
        if (!service) {
            throw new Error(`Service "${key}" not found`);
        }
        return service;
    }

    public has(key: string): boolean {
        return this.services.has(key);
    }

    public clear(): void {
        this.services.clear();
    }
}