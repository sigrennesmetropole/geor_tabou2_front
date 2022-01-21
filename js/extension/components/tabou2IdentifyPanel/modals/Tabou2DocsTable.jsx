import React, { useState, useEffect } from 'react';
import { Grid, Row, Pagination, Col } from 'react-bootstrap';
import { uniqueId, orderBy, isEmpty, find } from 'lodash';
import { Data } from "react-data-grid-addons";
import Tabou2DocsForm from '../../form/Tabou2DocsForm';

import Tabou2DocsActions from "./Tabou2DocsActions";

import TabouDataGrid from '../../common/TabouDataGrid';

export default function Tabou2DocsTable({
    documents = [],
    refresh = () => { },
    changePage = () => { },
    displayPages = false,
    pages = 0,
    page = 1,
    readOnly = true,
    download = () => {}
}) {
    const newDoc = find(documents, { action: 6 });
    const [rows, setRows] = useState(documents);
    const [filters, setFilters] = useState({});
    const [row, setRow] = useState({});

    useEffect(() => {
        if (newDoc?.action) return setRow(newDoc);
    }, [newDoc?.action]);

    useEffect(() => {
        setRows(documents);
        return;
    }, [page, documents.length]);

    const formVisible = [2, 3, 6].includes(row?.action);
    const defaultColumnProperties = {
        // sortable: true
    };

    const triggerAction = (target) => {
        console.log(target);
        switch (target?.action) {
        case 5:
            download(target?.document?.row?.id);
            break;
        default:
            break;
        }
    };

    const changeAction = (target) => {
        if (!target.action) {
            setRow({});
            refresh();
        } else {
            setRow(target);
        }
        triggerAction(target);
    };

    const rowActionsformatter = (document) => {
        return (
            <Tabou2DocsActions
                readOnly={readOnly}
                document={document}
                onClick={changeAction}
            />);
    };
    const selectors = Data.Selectors;

    const columns = [{
        key: "nom",
        name: "Nom",
        sortDescendingFirst: true,
        sortable: true,
        filterable: true
    }, {
        key: "typeMime",
        name: "Format",
        sortable: true,
        filterable: true
    }, {
        key: "id",
        name: "Actions",
        formatter: rowActionsformatter
    }].map(c => ({ ...c, ...defaultColumnProperties }));

    const rowKeyGetter = () => {
        return uniqueId();
    };

    if (isEmpty(documents)) return null;

    const getRows = () => {
        return selectors.getRows({ rows, filters });
    };

    const sortRows = (sortColumn, sortDirection) => {
        return sortDirection === "NONE" ?
            documents : orderBy(documents, sortColumn, sortDirection.toLowerCase());
    };

    const handleFilterChange = filter => filters => {
        const newFilters = { ...filters };
        if (filter.filterTerm) {
            newFilters[filter.column.key] = filter;
        } else {
            delete newFilters[filter.column.key];
        }
        return newFilters;
    };

    return (
        <>
            {(!formVisible && displayPages) && (<Col xs={12} className="text-center">
                <Pagination
                    prev next first last ellipsis boundaryLinks
                    bsSize="small"
                    items={pages}
                    maxButtons={5}
                    activePage={page + 1}
                    onSelect={(n) => changePage(n - 1)} />
            </Col>)}
            <Grid className="col-xs-12">
                {!formVisible && (<TabouDataGrid
                    id="tabou-documents-grid"
                    columns={columns}
                    rowsGetter={rowKeyGetter}
                    rowGetter={i => getRows()[i]}
                    rowsCount={getRows()?.length}
                    onGridSort={(sortColumn, sortDirection) =>
                        setRows(sortRows(sortColumn, sortDirection))
                    }
                    activeFilters
                    onAddFilter={filter => setFilters(handleFilterChange(filter))}
                    onClearFilters={() => setFilters({})}
                />)}
                {formVisible && (
                    <Row>
                        <Tabou2DocsForm document={row.document.row} action={row.action} onClick={changeAction} />
                    </Row>
                )}
            </Grid>
        </>
    );
}
