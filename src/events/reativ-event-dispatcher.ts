export interface ReativEvent {
    event: string;
    data?: any;
    listeners: ((event: ReativEvent) => void)[];
}

export default abstract class ReativEventDispatcher {

    private events: ReativEvent[] = [];

    constructor() {
        this.events = [];
    }

    addEventListener(event: string, callback: ((event: ReativEvent) => void)): void {
        const index = this.events.findIndex((e: ReativEvent) => e.event === event);

        if (index >= 0) {
            this.events[index].listeners.push(callback);
        } else {
            this.events.push({ event, listeners: [callback]});
        }
    }

    removeEventListener(event: string, callback: ((event: ReativEvent) => void)): boolean {
        const index = this.events.findIndex((e: ReativEvent) => e.event === event);

        if (index < 0) {
            return false;
        }

        this.events[index].listeners = this.events[index].listeners.filter(listener => listener.toString() !== callback.toString());
        return true;
    }

    dispatch(event: string, data: any): void {
        const index = this.events.findIndex((e: ReativEvent) => e.event === event);
        if (index < 0) {
            return;
        }

        this.events[index].listeners.forEach(listener => listener({ ...this.events[index], data }));
    }
}