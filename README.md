# tolkam/react-toggleables

Base components for toggleable elements (tabs, etc.).

## Usage

````tsx
import { render } from 'react-dom';
import { Toggleables, Toggleable, Trigger } from '@tolkam/react-toggleables';

const element = <Toggleables defaultActive="two">
    <div>
        <ul>
            <Trigger of="one"><li><a href="">Show One</a></li></Trigger>
            <Trigger of="two"><li><a href="">Show Two</a></li></Trigger>
            <Trigger of="three"><li><a href="">Show Three</a></li></Trigger>
        </ul>
        <Toggleable name="one"><p>Tab One</p></Toggleable>
        <Toggleable name="two"><p>Tab Two</p></Toggleable>
        <Toggleable name="three"><p>Tab Three</p></Toggleable>
    </div>
</Toggleables>

render(element, document.getElementById('app'));
````

## Documentation

The code is rather self-explanatory and API is intended to be as simple as possible. Please, read the sources/Docblock if you have any questions. See [Usage](#usage) for quick start.

## License

Proprietary / Unlicensed 🤷
