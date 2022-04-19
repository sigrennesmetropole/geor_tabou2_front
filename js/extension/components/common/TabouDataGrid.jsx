import PropTypes from 'prop-types';

import ReactDataGrid from "react-data-grid";

class TabouDataGrid extends ReactDataGrid {
    static propTypes = {
        activeFilters: PropTypes.bool
    }
    componentDidMount() {
        if (this.props.activeFilters && this.onToggleFilter) {
            this.onToggleFilter();
        }
        this._mounted = true;
        window.addEventListener('resize', this.metricsUpdated);
        if (this.props.cellRangeSelection) {
            window.addEventListener('mouseup', this.onWindowMouseUp);
        }
        this.metricsUpdated();
    }
}

export default TabouDataGrid;
