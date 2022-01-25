import React, {useEffect, useState} from 'react';
import { connect } from 'react-redux';
import { isEmpty } from "lodash";
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import Message from "@mapstore/components/I18N/Message";
import Tabou2DocsTable from "./Tabou2DocsTable";
import { getDocuments, downloadDocument, deleteDocument, addTabouDocument, modifyDocument } from "../../../actions/tabou2";
import { getFeatureDocuments, getAuthInfos, getPluginCfg } from "../../../selectors/tabou2";

function Tabou2DocsModal({
    visible,
    authInfos = {},
    ...props // {click(), documents[]}
}) {
    const [newDoc, setNewDoc] = useState({});
    const [page, setPage] = useState(0);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        setPage(0);
        return () => props.loadDocuments(!visible);
    }, [visible]);

    const refresh = (t = "") => {
        setNewDoc({});
        props.loadDocuments(true, page, !t && searchText ? searchText : t || "");
    };
    useEffect(() => {
        refresh(searchText);
    }, [page]);

    const isReadOnly = ![authInfos?.isReferent, authInfos?.isContrib].includes(true);

    const documents = props?.documents?.elements || [];
    const count = props.documents?.totalElements || 0;

    const SCHEMA_DOC = {
        nom: "",
        libelle: "",
        id: "",
        modifDate: "",
        modifUser: "",
        typeMime: ""
    };
    // toolbar button
    const buttons = [{
        text: "",
        bsSize: "lg",
        bsStyle: 'primary',
        glyph: "plus",
        style: {
            color: "white", backgroundColor: "rgb(40,167,69)",
            borderColor: "rgb(40,167,69)"
        },
        tooltip: "Ajouter un document",
        onClick: () => setNewDoc({document: SCHEMA_DOC, action: 6})
    }];
    const countPages = count ? Math.ceil(count / props.config?.apiCfg?.documentsByPage)  : 0;
    return (
        <ResizableModal
            title={<Message msgId="tabou2.docsModal.title"/>}
            bodyClassName="ms-flex"
            show={visible}
            showClose
            buttons={buttons}
            onClose={props.onClick}
            size="lg">
            <Tabou2DocsTable
                translate={{i18n: props.i18n, messages: props.messages}}
                refresh={refresh}
                readOnly={isReadOnly}
                onInput={(t) => {
                    refresh(t);
                    setSearchText(t);
                }}
                page={page}
                pages={countPages}
                changePage={setPage}
                id={props.documents?.id}
                documents={isEmpty(newDoc) ? documents : [...documents, newDoc]}
                download={props.download}
                remove={(id) => {props.remove(id); setPage(0);}}
                save={(file, metadata) => {props.save(file, metadata); refresh();}}
                update={(file, metadata) => {props.update(file, metadata); refresh();}}
            />
        </ResizableModal>
    );
}

// connect to store / redux
export default connect(state => ({
    // selectors
    documents: getFeatureDocuments(state),
    authInfos: getAuthInfos(state),
    config: getPluginCfg(state)
}), {
    // actions
    loadDocuments: getDocuments,
    download: downloadDocument,
    remove: deleteDocument,
    save: addTabouDocument,
    update: modifyDocument
})(Tabou2DocsModal);
