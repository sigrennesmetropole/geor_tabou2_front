import * as Rx from 'rxjs';
/**
 * Intercepts actions of type CADASTRAPP:SETUP.
 * - Load configuration if missing
 * - adds layers if needed
 */
export const tabou2Setup = (action$, { getState = () => { } }) => {
    action$.ofType(SETUP).switchMap(() =>
        console.log('INIT TABOU2')
    );
}

/**
 * Intercept cadastrapp close event.
 * - Removes the layers from the map
 * - Disable tools
 */
export const tabou2SetupTearDown = (action$, { getState = () => { } }) => {
    action$.ofType(TEAR_DOWN).switchMap(() =>
        console.log('CLOSE TABOU2')
    );

}