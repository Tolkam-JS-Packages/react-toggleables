import * as React from 'react';
import { cloneElement, HTMLProps, PureComponent, Children, isValidElement } from 'react';
import { classNames } from '@tolkam/lib-utils-ui';
import ToggleablesContext from './context';
import Toggleable from './Toggleable';

export default class Toggleables extends PureComponent<IProps, IState> {

    /**
     * @type IState
     */
    public state = {
        active: null,
        pending: false,
    };

    /**
     * @type TChildren
     */
    protected children: TChildren = {};

    /**
     * @inheritDoc
     */
    public componentDidMount(): void {
        const { props, activate } = this;
        const { defaultActive } = props;

        defaultActive && activate(defaultActive);
    }

    /**
     * Registers child
     *
     * @param name
     * @param child
     */
    public register(name: string, child: Toggleable) {
        const that = this;
        const { onRegister, onUnregister } = that.props;
        const children = that.children;
        children[name] = children[name] || [];

        const len = children[name].push(child);
        onRegister && onRegister(name, child);

        return () => {
            children[name].splice(len-1, 1);
            if(!children[name].length) {
                delete children[name];
            }
            onUnregister && onUnregister(name, child);
        };
    }

    /**
     * @inheritDoc
     */
    public render() {
        const that = this;
        const props = that.props;
        const { pendingClassName } = props;
        const child = Children.only(props.children);

        if(!isValidElement(child)) {
            return null;
        }

        const childProps = child.props;
        const className = classNames(childProps.className, {
            [pendingClassName || '']: that.state.pending,
        });

        return <ToggleablesContext.Provider value={that}>
            {cloneElement(child, {...childProps, className})}
        </ToggleablesContext.Provider>;
    }

    /**
     * Activates registered child
     *
     * @param name
     */
    protected activate = (name: string) => {
        const that = this;
        const { children, update } = that;
        const promises: Promise<any>[] = [];
        const prevActive = that.state.active;

        // already active
        if(prevActive === name) {
            return;
        }

        // collect beforeActivate promises
        children[name].forEach((item) => {
            const { beforeActivate } = item.props;
            promises.push(beforeActivate ? beforeActivate() : Promise.resolve());
        });

        that.setState({pending: true});
        Promise.all(promises).then(() => {
            update(name, true);
            update(prevActive, false);
        }).catch((e) => {
            if (process.env.NODE_ENV !== 'production') {
                console.warn('Toggleables: failed to activate "%s"', name, e);
            }
        }).finally(() => {
            that.setState({pending: false, active: name});
        });
    };

    /**
     * Updates children state
     *
     * @param name
     * @param active
     */
    protected update = (name: string | null, active: boolean) => {
        name && this.children[name].forEach(item => {
            const { onActivate, onDeactivate } = item.props;
            if(item.isActive() !== active) {
                item.setActive(active);
                active ? onActivate && onActivate() : onDeactivate && onDeactivate();
            }
        });
    };
}

type TChildren = {
    [name: string] : Toggleable[]
};
type TLifecycleCallback = (name: string, child: Toggleable) => any;

export interface IProps extends HTMLProps<HTMLDivElement> {
    defaultActive?: string;
    pendingClassName?: string;

    onRegister?: TLifecycleCallback;
    onUnregister?: TLifecycleCallback;
}

export interface IState {
    pending: boolean;
    active: string | null;
}
