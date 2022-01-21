import React, {useEffect, useState} from 'react';
import { connect } from 'react-redux';
import { isEmpty } from "lodash";
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import Message from "@mapstore/components/I18N/Message";
import Tabou2DocsTable from "./Tabou2DocsTable";
import { getDocuments } from "../../../actions/tabou2";
import { getFeatureDocuments, getAuthInfos, getPluginCfg } from "../../../selectors/tabou2";

function Tabou2DocsModal({
    visible,
    ...props // {click(), documents[]}
}) {
    const [newDoc, setNewDoc] = useState({});
    const [page, setPage] = useState(0);

    useEffect(() => {
        return () => props.loadDocuments(!visible);
    }, [visible]);

    useEffect(() => {
        props.loadDocuments(true, page);
    }, [page]);

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
    const refresh = () => {
        setNewDoc({});
        props.loadDocuments(true, page);
    };

    return (
        <ResizableModal
            title={<Message msgId="tabou2.docsModal.title"/>}
            bodyClassName="ms-flex"
            show={visible}
            showClose
            buttons={buttons}
            onClose={props.onClick}
            size="lg">
            {(
                <Tabou2DocsTable
                    displayPages={count &&  count > props.config?.apiCfg?.documentsByPage}
                    refresh={refresh}
                    page={page}
                    pages={Math.round(count / props.config?.apiCfg?.documentsByPage)}
                    changePage={setPage}
                    documents={isEmpty(newDoc) ? documents : [...documents, newDoc]}
                />
            )}
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
    loadDocuments: getDocuments
})(Tabou2DocsModal);
