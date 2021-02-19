import React from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';

export default function Tabou2LogsModal({
    visible,
    onClick = () => {}
}) {
    return (
        <ResizableModal
            title={"Journal des événements"}
            bodyClassName="ms-flex"
            show={visible}
            showClose
            onClose={onClick}
            size="lg">
            <div> MODAL BODY </div>
        </ResizableModal>
    );
}
