import React, { ReactNode } from 'react';

import * as modalStyles from './modal.module.css';

interface ModalProps {
    visible: boolean
}

const Modal : React.FC<ModalProps> = ({visible, children}) => (
    <div className={`${modalStyles.modalCover} ${visible ? 'block' : 'hidden'}`}>
        <div className={modalStyles.modalContent}>
            {children}
        </div>
    </div>
)

export default Modal
