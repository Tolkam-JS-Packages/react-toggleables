import * as React from 'react';
import { HTMLProps, PureComponent, MouseEvent, cloneElement, isValidElement, Children } from 'react';
import { classNames } from '@tolkam/lib-utils-ui';
import ToggleablesContext from './context';

export default class Trigger extends PureComponent<IProps> {

    /**
     * @type ToggleablesContext
     */
    public static contextType = ToggleablesContext;

    /**
     * @inheritDoc
     */
    public render(): any {
        const props = this.props;
        const child = Children.only(props.children);

        if(!isValidElement(child)) {
            return <span dangerouslySetInnerHTML={{__html: '<!--invalid child-->'}} />;
        }

        const childProps = child.props;
        const elProps = {
            name: props.name,
            onClick: this.onClick,
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
    protected onClick = (e: MouseEvent<HTMLSpanElement>) => {
        e.preventDefault();
        this.context.activate(this.props.of);
    };
}

export interface IProps extends HTMLProps<HTMLElement> {
    of: string
}
