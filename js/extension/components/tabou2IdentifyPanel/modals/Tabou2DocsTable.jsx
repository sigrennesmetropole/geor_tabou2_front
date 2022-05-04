import React, { useState, useEffect } from 'react';
import { Grid, Row, Pagination, Col } from 'react-bootstrap';
import { uniqueId, orderBy, find, isEmpty } from 'lodash';
import { Data } from "react-data-grid-addons";
import Message from "@mapstore/components/I18N/Message";
import Tabou2DocsForm from '../../form/Tabou2DocsForm';
import Tabou2DocsActions from "./Tabou2DocsActions";
import TabouDataGrid from '../../common/TabouDataGrid';
import Tabou2TextForm from '@js/extension/components/form/Tabou2TextForm';
export default function Tabou2DocsTable({
    documents = [],
    refresh = () => { },
    changePage = () => { },
    pages = 1,
    page = 1,
    readOnly = true,
    download = () => {},
    remove = () => {},
    save = () => {},
    update = () => {},
    onInput,
    translate,
    id
}) {
    const [rows, setRows] = useState(documents);
    const [filters, setFilters] = useState({});
    const [row, setRow] = useState({});
    const [search, setSearch] = useState("");
    const [newDoc, setNewDoc] = useState({});
    useEffect(() => {
        if (newDoc?.action) {
            return setRow(newDoc);
        }
        return () => {};
    }, [newDoc?.action]);

    useEffect(() => {
        setRows(documents);
        return;
    }, [page, pages]);

    useEffect(() => {
        setRows(documents);
        let createDoc = find(documents, { action: 6 });
        if (!isEmpty(createDoc)) {
            setNewDoc(createDoc);
            return setRow(createDoc);
        }
    }, [id, documents.length]);

    const formVisible = [2, 3, 6].includes(row?.action);
    const defaultColumnProperties = {
        // sortable: true
    };

    /**
     * Trigger action by number :
     * 0 - cancel
     * 1 - save
     * 2 - open and read only
     * 3 - open in edit mode
     * 4 - delete
     * 5 - download
     * 6 - save new doc
     * 7 - save update edition
     * @param {target} any row selected
     * @returns trigger click method
     */
    const triggerAction = (target) => {
        switch (target?.action) {
        case 5:
            download(target?.document?.row?.id);
            break;
        case 4:
            remove(target?.document?.row?.id);
            break;
        case 1:
            save(target?.file, target.metadata);
            break;
        case 7:
            update(target.file, target.metadata);
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
        name: translate.i18n(translate.messages, "tabou2.docsModal.docsForm.name"),
        sortDescendingFirst: true,
        sortable: true,
        filterable: true
    }, {
        key: "libelleTypeDocument",
        name: translate.i18n(translate.messages, "tabou2.docsModal.docsForm.type"),
        sortable: true,
        filterable: true
    }, {
        key: "dateDocument",
        name: translate.i18n(translate.messages, "tabou2.docsModal.docsForm.date"),
        sortable: true,
        filterable: true,
        formatter: (doc) => doc.row.dateDocument ? new Date(doc.row.dateDocument).toLocaleDateString() : null
    }, {
        key: "typeMime",
        name: translate.i18n(translate.messages, "tabou2.docsModal.docsForm.format"),
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
    let displayTable = !isEmpty(documents) && !formVisible;
    return (
        <>
            <Col xs={12} className="text-center" style={{marginTop: "5px"}}>
                {(displayTable && pages) && (
                    <Pagination
                        prev next first last ellipsis boundaryLinks
                        bsSize="small"
                        items={pages}
                        maxButtons={5}
                        activePage={page + 1}
                        onSelect={(n) => changePage(n - 1)} />
                ) || (
                    <p>{
                        search && (<p><Message msgId="tabou2.docsModal.noResult" /></p>)
                    }</p>
                )}
            </Col>
            <Grid className="col-xs-12">
                {displayTable && (
                    <TabouDataGrid
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
                    />
                )}
                {formVisible && (
                    <Row>
                        <Tabou2DocsForm
                            document={row.document.row}
                            action={row.action}
                            translate={translate}
                            onClick={changeAction}
                        />
                    </Row>
                )}
            </Grid>
            {displayTable || search ?  (
                <Col xs={3} className="col-xs-offset-9" style={{ marginTop: "10px" }}>
                    <Tabou2TextForm
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            onInput(e.target.value);
                        }}
                        placeholder={translate.i18n(translate.messages, "tabou2.docsModal.searchPlaceholder")}
                    />
                </Col>) : null}
        </>
    );
}
