import { ContextType, createContext } from 'react';
import Toggleables from './Toggleables';

const ToggleablesContext = createContext<Toggleables|null>(null);

ToggleablesContext.displayName = 'ToggleablesContext';

type TContext = NonNullable<ContextType<typeof ToggleablesContext>>;

export default ToggleablesContext;
export { TContext }
