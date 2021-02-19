import React from 'react';
import ResizableModal from '@mapstore/components/misc/ResizableModal';

export default function Tabou2TiersModal({
    visible,
    onClick = () => {}
}) {
    return (
        <ResizableModal
            title={"Tiers associés"}
            bodyClassName="ms-flex"
            show={visible}
            showClose
            onClose={onClick}
            size="lg">
            <div> MODAL BODY </div>
        </ResizableModal>
    );
}
