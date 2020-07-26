export interface RouteInterface {
    path: string | RegExp;
    renderer?: any;
    callback?: (route?: RouteInterface) => void;
}

export class Route {

    data: any = {};

    private route: RouteInterface;

    get path(): string {
        return this.route.path.toString();
    }

    get renderer(): any {
        return this.route.renderer;
    }

    get callback(): (route?: RouteInterface) => void {
        return this.route.callback;
    }

    constructor(route: RouteInterface) {
        this.route = route;
    }

    match(path: string): boolean {
        if (this.path.indexOf(':') > 0) {
            const pathSegments = path.split('/');
            const routeSegments = this.segments();

            if (pathSegments.length !== routeSegments.length) {
                return false;
            }

            for (let i = 0; i < pathSegments.length; i++) {
                if (routeSegments[i].charAt(0) === ':') {
                    this.data[routeSegments[i].substr(1)] = pathSegments[i];
                    continue;
                }

                if (pathSegments[i] !== routeSegments[i]) {
                    return false;
                }
            }

            return true;
        }

        return this.path === path;
    }

    private segments(): string[] {
        return this.path.split('/');
    }
}
