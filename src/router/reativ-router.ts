import { Route } from './route';
import { RouteInterface } from './route';
import ReativEventDispatcher from '../events/reativ-event-dispatcher';

export interface RouterOptions {
    rootElement?: Element | string,
    initialPath?: string;
    locationStrategy?: LocationStrategy;
    routes?: RouteInterface[];
}

export enum LocationStrategy {
    HISTORY = 'history',
    HASH = 'hash'
}

export class ReativRouter extends ReativEventDispatcher {

    private root: Element;
    private initialPath: string;

    private routes: Route[] = [];
    private locationStrategy: LocationStrategy;

    private current: string;
    private interval: NodeJS.Timeout;

    constructor(options?: RouterOptions) {
        super();

        this.root = document.getElementById('root');
        this.locationStrategy = window.history.pushState ? LocationStrategy.HISTORY : LocationStrategy.HASH;

        if (options?.rootElement) {
            if (typeof options.rootElement === 'string') {
                this.root = document.querySelector(options.rootElement);
            } else {
                this.root = (options.rootElement as Element);
            }
        }

        if (options.locationStrategy) {
            this.locationStrategy = options.locationStrategy;
        }

        if (options.initialPath) {
            this.initialPath = options.initialPath;
        }

        if (options.routes) {
            this.routes = options.routes.map(route => new Route(route));
        }
    }

    add(route: RouteInterface): this {
        this.routes.push(new Route(route));
        return this;
    }

    remove(path: string): this {
        const index = this.routes.findIndex((route: Route) => route.path === path);
        this.routes = this.routes.slice(index, 1);
        return this;
    }

    flush(): this {
        this.routes = [];
        return this;
    }

    navigate(path: string): this {
        if (this.locationStrategy === LocationStrategy.HISTORY) {
             history.pushState(null, null, this.initialPath + this.clearSlashes(path));

        } else {
            location.href = `${location.href.replace(/#(.*)$/, '')}#${path}`;
        }
        return this;
    }

    listen(): void {
        if (this.locationStrategy === LocationStrategy.HASH) {
            window.addEventListener('hashchange', this.handleChange.bind(this));
        } else {
            // clearInterval(this.interval);
            // this.interval = setInterval(() => {
            //     if (this.current === this.getFragment()) {
            //         return;
            //     }
            //     this.current = this.getFragment();

            //     this.routes.some((route: Route) => {
            //         const match = this.current.match(route.path);
            //         if (match) {
            //             match.shift();
            //             route.callback(...match);
            //             return match;
            //         }
            //         return false;
            //     });
            // }, 50);
        }

        this.handleChange();
    }

    private clearSlashes(path: string) {
        return path
            .toString()
            .replace(/\/$/, '')
            .replace(/^\//, '')
    }

    private getFragment(): string {
        let fragment = '';

        if (this.locationStrategy === LocationStrategy.HISTORY) {
            fragment = this.clearSlashes(decodeURI(window.location.pathname + window.location.search));
            fragment = fragment.replace(/\?(.*)$/, '');
            fragment = this.initialPath !== '/' ? fragment.replace(this.initialPath, '') : fragment;
        } else {
            const match = window.location.href.match(/#(.*)$/);
            fragment = match ? match[1] : '';
        }

        return this.clearSlashes(fragment);
    }

    private handleChange(event?: HashChangeEvent): void {
        const path = location.hash.substr(1);
        const activeRoute = this.getActiveRoute(path)

        if (activeRoute) {
            this.activateRoute(activeRoute);
        } else {
            this.dispatch('notfound', event);
        }
    }

    private getActiveRoute(path: string): Route {
        return this.routes.find(route => route.match(path));
    }

    private activateRoute(route: Route): void {
        if (route.callback) {
            route.callback(route);
        }

        if (route.renderer) {
            this.root.innerHTML = route.renderer;
        }

        this.dispatch('activated', route);
    }
}