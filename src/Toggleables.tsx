import { cloneElement, HTMLProps, PureComponent, Children, isValidElement } from 'react';
import { classNames } from '@tolkam/lib-utils-ui';
import ToggleablesContext from './context';
import Toggleable from './Toggleable';

const STATE_PENDING = 0;
const STATE_ACTIVATE = 1;
const STATE_DEACTIVATE = -1;

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
        const { props, activate, children } = this;
        const defaultActive = props.defaultActive;

        if(defaultActive !== false) {
            const activeName = defaultActive || Object.keys(children)[0];
            activeName && activate(activeName);
        }
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
    public activate = (name: string) => {
        const that = this;
        const { children, update } = that;
        const { onBeforeActivate, onActivate } = that.props;
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

        that.setState(
            {pending: true},
            () => {
                update(name, STATE_PENDING);
                onBeforeActivate && onBeforeActivate(name)
            }
        );

        Promise.all(promises).then(() => {
            update(name, STATE_ACTIVATE);
            update(prevActive, STATE_DEACTIVATE);
        }).catch((e) => {
            if (process.env.NODE_ENV !== 'production') {
                console.warn('Toggleables: failed to activate "%s"', name, e);
            }
        }).finally(() => {
            that.setState(
                {pending: false, active: name},
                () => onActivate && onActivate(name)
            );
        });
    };

    /**
     * Updates children state
     *
     * @param name
     * @param state
     */
    protected update = (name: string | null, state: number) => {
        name && this.children[name].forEach(item => {
            const { onActivate, onDeactivate } = item.props;

            if(state === STATE_PENDING) {
                !item.isPending() && item.setPending(true);
            } else {
                const activate = (state === STATE_ACTIVATE);
                if(item.isActive() !== activate) {
                    item.setPending(false);
                    item.setActive(activate);
                    activate
                        ? onActivate && onActivate()
                        : onDeactivate && onDeactivate();
                }
            }
        });
    };
}

type TChildren = {
    [name: string] : Toggleable[]
};
type TRegisterCallback = (name: string, child: Toggleable) => any;
type TActivateCallback = (name: string) => any;

export interface IProps extends HTMLProps<HTMLDivElement> {
    defaultActive?: string | false;
    pendingClassName?: string;

    onRegister?: TRegisterCallback;
    onUnregister?: TRegisterCallback;
    onBeforeActivate?: TActivateCallback;
    onActivate?: TActivateCallback;
}

export interface IState {
    pending: boolean;
    active: string | null;
}
