import React from "react";
import Message from "@mapstore/components/I18N/Message";
import src from "../assets/markers_default.png";
import ResponsivePanel from "@mapstore/components/misc/panels/ResponsivePanel";
import { SIZE } from "../constants/main";

const Extension = ({
    active,
    dockStyle = {},
    value = 0,
    onIncrease,
    changeZoomLevel,
}) => {
    return (
        <ResponsivePanel
            containerStyle={dockStyle}
            containerId="tabou2-container"
            containerClassName="dock-container"
            className="tabou2-dock-panel"
            open={active}
            position="right"
            size={SIZE}
            bsStyle="primary"
            glyph="maps-catalog"
            title={<Message msgId="extension.title" />}
            onClose={() => onClose()}
            style={dockStyle}
        >
            <div id="SAMPLE_EXTENSION">
                <h2>Extension Sample</h2>
                <div>
                    This is a sample extension plugin. The following tools
                    demonstrate the correct binding inside MapStore
                </div>
                <h3>State and epics</h3>
                <div>
                    A button like this should be visualized also in the toolbar:{" "}
                    <br />
                    <button
                        onClick={() => onIncrease(value + 1)}
                        className="btn-primary square-button btn"
                    >
                        INC
                    </button>
                    <br />{" "}
                </div>
                <div>
                    Clicking on that button (or on the button above) should
                    increase this counter value: <b>{value}</b>. <br />
                    The counter value updates should be logged in console by an
                    epic
                </div>
                <i>
                    note: the button in the toolbar can be hidden, in this case
                    click on the "..." button
                </i>
                <h3>Localization</h3>
                The following text should be localized:{" "}
                <b>
                    <Message msgId="extension.message" />
                </b>
                <br /> (you should see something like "Message!" if your
                language is set to en-US)
                <h3>Core action</h3>
                This button should change the zoom level to "1"
                <button
                    onClick={() => {
                        changeZoomLevel(1);
                    }}
                >
                    zoom to level 1
                </button>
                Here a sample image with several markers:
                <img src={src} />
            </div>
        </ResponsivePanel>
    );
};

export default Extension;
