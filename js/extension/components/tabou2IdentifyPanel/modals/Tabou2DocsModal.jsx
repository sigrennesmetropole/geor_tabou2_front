import React, {useEffect, useState, useRef} from 'react';
import { connect } from 'react-redux';
import { isEmpty } from "lodash";
import { Row } from 'react-bootstrap';

import ResizableModal from '@mapstore/components/misc/ResizableModal';
import Message from "@mapstore/components/I18N/Message";
import { getDocuments, downloadDocument, deleteDocument, addTabouDocument, modifyDocument } from "../../../actions/tabou2";
import { getFeatureDocuments, getAuthInfos, getPluginCfg, documentsLoading } from "../../../selectors/tabou2";
import Tabou2DocsActions from "./Tabou2DocsActions";
import { Data } from "react-data-grid-addons";
import Tabou2DocsForm from '../../form/Tabou2DocsForm';

import Loader from '@mapstore/components/misc/Loader';
import Tabou2Information from '../../common/Tabou2Information';
import "../../../css/tabou.css";

import TabouAdaptiveDataGrid from '../../common/TabouAdaptiveDataGrid';


function Tabou2DocsModal({
    visible,
    authInfos = {},
    ...props // {click(), documents[]}
}) {
    const canvas = useRef(null);
    const translate = { i18n: props.i18n, messages: props.messages };
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rows, setRows] = useState([]);
    const [row, setRow] = useState({});
    const [filters, setFilters] = useState({});
    const [maxPages, setMaxPages] = useState(0);
    const [filtered, setFiltered] = useState(false);
    const [newDoc, setNewDoc] = useState({});
    const [deleted, setDeleted] = useState("");

    const isReadOnly = ![authInfos?.isReferent, authInfos?.isContrib].includes(true);
    /**
     * To get or refresh all document list
     * @param {number} p as page
     */
    const refresh = (p, headerFilters) => {
        setRow({});
        setNewDoc({});
        props.loadDocuments(true, p, headerFilters);
    };
    const resetFilters = () => {
        setPage(0);
        setMaxPages(0);
        setFiltered(false);
        setRows([]);
        refresh(0, {});
    };
    useEffect(() => {
        if (newDoc?.action) {
            return setRow(newDoc);
        }
        return () => {};
    }, [newDoc?.action, props.loaderDocuments]);
    // update on modal visible change
    useEffect(() => {
        setIsLoading(false);
        return () => props.loadDocuments(!visible);
    }, [visible]);
    // update on new documents list requested
    useEffect(() => {
        if (props.documents?.totalElements) {
            if (!maxPages && !filtered) {
                setFilters({});
                setMaxPages(Math.ceil(props.documents?.totalElements / props.config?.apiCfg?.documentsByPage));
            }
            // get max pages number
            let newRows = props.documents?.elements || [];
            const oldRowsId = rows.map(r => r.id);
            newRows = newRows.filter(n => !oldRowsId.includes(n.id));
            // force to hide deleted - link to issue 193
            setRows([...rows.filter(r => r.id !== deleted), ...newRows.filter(n => !oldRowsId.includes(n.id))]);
        } else {
            setRows([]);
        }
        return () => setIsLoading(false);
    }, [props.documents?.id, filtered]);
    // on init
    useEffect(() => {
        setFilters({});
        setRows({});
        setMaxPages(Math.ceil(props.documents?.totalElements / props.config?.apiCfg?.documentsByPage));
    }, []);
    // update on filter
    useEffect(() => {
        const docFilters = {};
        Object.keys(filters).forEach(k => {
            docFilters[k] = filters[k]?.filterTerm;
        });
        if (isEmpty(docFilters)) {
            resetFilters();
        } else {
            setFiltered(true);
            setPage(0);
            setMaxPages(0);
            refresh(0, docFilters);
        }
    }, [JSON.stringify(filters)]);

    /**
     * Trigger on scroll event
     * @param {string} scrollDirection
     */
    const onScroll = ({ scrollDirection }) => {
        const gridCanvas = canvas.current.canvas;
        const isAtBottom = gridCanvas.scrollTop + 10 >= gridCanvas.scrollHeight - gridCanvas.clientHeight;
        const nextPage = page + 1;
        const maxLoaded = props.documents?.totalElements === rows.length;
        if (maxLoaded || isLoading || scrollDirection !== "downwards" || !isAtBottom || nextPage > maxPages) return;
        // scroll to next page
        refresh(nextPage, filters);
        setPage(nextPage);
        setIsLoading(true);
    };

    const remove = (id) => {
        setRows([]);
        props.remove(id);
        refresh(0, filters);
        setDeleted(id);
    };
    const save = (file, metadata) => {
        setRows([]);
        props.save(file, metadata);
        refresh(0, filters);
    };
    const update = (file, metadata) => {
        setRows([]);
        props.update(file, metadata);
        refresh(0, filters);
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
            props.download(target?.document?.row?.id);
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
    const SCHEMA_DOC = {
        nom: "",
        libelle: "",
        id: "",
        modifDate: "",
        modifUser: "",
        typeMime: "",
        dateDocument: ""
    };
    // toolbar button
    const buttons = isReadOnly || !isEmpty(newDoc) || !isEmpty(row) ? [] : [{
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "plus",
        style: {
            color: "white", backgroundColor: "rgb(40,167,69)",
            borderColor: "rgb(40,167,69)"
        },
        tooltip: "Ajouter un document",
        onClick: () => setNewDoc({ document: SCHEMA_DOC, action: 6 })
    }, {
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "refresh",
        tooltip: "Rafraîchir",
        style: {marginLeft: "2px"},
        onClick: () => {
            setRows([]);
            refresh(0, {});
        }
    }];
    const rowActionsformatter = (document) => {
        return (
            <Tabou2DocsActions
                readOnly={isReadOnly}
                document={document}
                onClick={changeAction}
            />);
    };
    const defaultColumnProperties = {
        // sortable: true
    };
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
    const rowKeyGetter = (r) => {
        return r.id;
    };
    const getRows = () => {
        return Data.Selectors.getRows({ rows, filters });
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
    const formVisible = [2, 3, 6].includes(row?.action);
    let displayTable = rows.length && !formVisible;
    const size = 20;
    return (
        <ResizableModal
            title={<Message msgId="tabou2.docsModal.title"/>}
            bodyClassName="ms-flex tabou-doc-modal"
            show={visible}
            buttons={buttons}
            id="doc-modal"
            showClose
            onClose={() => {
                resetFilters();
                props.onClick();
            }}
            size="lg">
            {displayTable ?
                <>
                    <Tabou2Information
                        isVisible={!rows.length && isEmpty(newDoc) && !isEmpty(row)}
                        glyph="folder-open"
                        title={<Message msgId="tabou2.docsModal.noRows" />}
                        message={<Message msgId="tabou2.docsModal.createRowMsg" />}
                    />
                    <TabouAdaptiveDataGrid
                        id="tabou-documents-grid"
                        minHeight={400}
                        ref={canvas}
                        columns={columns}
                        rowsGetter={rowKeyGetter}
                        rowGetter={i => getRows()[i]}
                        rowsCount={getRows()?.length}
                        displayFilters
                        virtualScroll
                        onAddFilter={filter => setFilters(handleFilterChange(filter))}
                        onClearFilters={() => refresh(page)}
                        onScroll={onScroll}
                    />
                </> : null}
            {!props.loaderDocuments && formVisible && (
                <Tabou2DocsForm
                    document={row.document.row}
                    action={row.action}
                    translate={translate}
                    onClick={changeAction}
                    direction="downwards"
                />
            )}
            {
                props.loaderDocuments && !displayTable ? (
                    <>
                        <Tabou2Information
                            isVisible={props.loadDocuments}
                            style={{ margin: "5% auto" }}
                            glyph=""
                            message="Récupération des documents en cours"
                            title="Chargement..."
                        />
                        <Loader size={size} style={{ padding: size / 10, margin: "auto", display: "flex" }} />
                    </>
                ) : null
            }
            {
                props.loaderDocuments && displayTable ? (
                    <div className="doc-load-text">
                        <Loader size={size} style={{ padding: size / 10, margin: "auto", display: "flex" }} />
                        <span>Chargement des données</span>
                    </div>
                ) : null
            }
        </ResizableModal>
    );
}

// connect to store / redux
export default connect(state => ({
    // selectors
    documents: getFeatureDocuments(state),
    authInfos: getAuthInfos(state),
    config: getPluginCfg(state),
    loaderDocuments: documentsLoading(state)
}), {
    // actions
    loadDocuments: getDocuments,
    download: downloadDocument,
    remove: deleteDocument,
    save: addTabouDocument,
    update: modifyDocument
})(Tabou2DocsModal);
