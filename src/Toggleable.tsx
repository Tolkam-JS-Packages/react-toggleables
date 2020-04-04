import * as React from 'react';
import { PureComponent, HTMLAttributes, Children, cloneElement, isValidElement } from 'react';
import { classNames } from '@tolkam/lib-utils-ui';
import Animatable from '@tolkam/react-animatable';
import ToggleablesContext, { TContext } from './context';

export default class Toggleable extends PureComponent<IProps, IState> {

    public static defaultProps = {
        activeClassName: 'active',
    };

    /**
     * @type IState
     */
    public state = {
        active: false,
    };

    /**
     * @type ToggleablesContext
     */
    public static contextType = ToggleablesContext;

    /**
     * @type Function
     */
    protected destroy?: Function;

    /**
     * @param props
     * @param context
     */
    constructor(props: IProps, context: TContext) {
        super(props, context);
        this.destroy = context.register(props.name, this);
    }

    /**
     * Activates item
     */
    public setActive = (active: boolean) => {
        this.setState({ active });
    };

    /**
     * Checks if item is active
     */
    public isActive() {
        return this.state.active;
    }

    /**
     * @inheritDoc
     */
    public componentWillUnmount(): void {
        const destroy = this.destroy;
        destroy && destroy();
    }

    /**
     * @inheritDoc
     */
    public render() {
        const that = this;
        const { props, state } = that;
        const { activeClassName, unmount } = props;
        const { active } = state;
        const child = Children.only(props.children);

        if(!isValidElement(child)) {
            return null;
        }

        const childProps = child.props;
        const elProps = {
            // when parent is Trigger, pass it's onClick() to child
            onClick: props.onClick,
            ...childProps,
            className: classNames(childProps.className, {
                [activeClassName as string]: active,
            }),
        };

        return <Animatable show={active} keepMounted={!unmount}>
            {cloneElement(child, elProps)}
        </Animatable>;
    }
}

export interface IProps extends HTMLAttributes<Toggleable> {
    name: string;

    activeClassName?: string,

    // unmount if not active
    unmount?: boolean,

    beforeActivate?: () => Promise<any>,
    onActivate?: () => void,
    onDeactivate?: () => void,
}

export interface IState {
    active: boolean;
}
