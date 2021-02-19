import React, { useEffect, useState } from 'react';
import ResizableModal from '.@mapstore/components/misc/ResizableModal';


export default function Tabou2Modal({...props}) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (props.visible) {
            setIsOpen(props.visible);
        }
    }, [props.visible]);

    return (
        <ResizableModal
            title={props.title || "MODAL HEADER"}
            bodyClassName="ms-flex"
            show={isOpen}
            showClose
            onClose={setIsOpen(false)}
            size="sm">
            <div> MODAL BODY </div>
        </ResizableModal>
    );
}
