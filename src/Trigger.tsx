import { HTMLProps, PureComponent, MouseEvent, KeyboardEvent, cloneElement, isValidElement, Children } from 'react';
import { classNames } from '@tolkam/lib-utils-ui';
import ToggleablesContext, { TContext } from './context';

export default class Trigger extends PureComponent<IProps> {

    /**
     * @type ToggleablesContext
     */
    public static contextType = ToggleablesContext;

    /**
     * @inheritDoc
     */
    public render(): any {
        const { props, onAction } = this;
        const child = Children.only(props.children);

        if(!isValidElement(child)) {
            return <span dangerouslySetInnerHTML={{__html: '<!--invalid child-->'}} />;
        }

        const childProps = child.props;
        const elProps = {
            name: props.name,
            onClick: onAction,
            onKeyDown: onAction,
            ...childProps,
            className: classNames(childProps.className, props.className),
        };

        return cloneElement(child, elProps);
    }

    /**
     * Activates toggleable
     *
     * @param e
     */
    protected onAction = (
        e: MouseEvent<HTMLSpanElement> & KeyboardEvent<HTMLSpanElement>
    ) => {
        if(e.type === 'keydown' && ['Enter', ' '].indexOf(e.key) < 0) {
            return;
        }

        e.preventDefault();
        (this.context as TContext).activate(this.props.of);
    };
}

export interface IProps extends HTMLProps<HTMLElement> {
    of: string
}
