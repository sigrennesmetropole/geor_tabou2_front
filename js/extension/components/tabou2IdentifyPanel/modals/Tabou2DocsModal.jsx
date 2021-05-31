import React from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import Message from "@mapstore/components/I18N/Message";
/**
 * Modal for documentation (Alfresco)
 * TODO : need all API services
 * @param {any} param
 * @returns component
 */
export default function Tabou2DocsModal({
    visible,
    onClick = () => {}
}) {
    return (
        <ResizableModal
            title={<Message msgId="tabou2.docsModal.title"/>}
            bodyClassName="ms-flex"
            show={visible}
            showClose
            onClose={onClick}
            size="lg">
            <div> MODAL BODY </div>
        </ResizableModal>
    );
}
