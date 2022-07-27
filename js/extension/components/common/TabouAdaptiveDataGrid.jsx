import DataGrid from '@mapstore/components/data/grid/DataGrid';

class TabouAdaptiveDataGrid extends DataGrid {
    componentDidMount() {
        this.setCanvasListener();
        if (this.props.displayFilters) {
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

export default TabouAdaptiveDataGrid;
