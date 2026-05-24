const CROP_RATIO = 4 / 3;

export function cropImage(dataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const ratio = img.width / img.height;
            if (Math.abs(ratio - CROP_RATIO) < 0.01) {
                resolve(dataUrl);
                return;
            }
            openCropModal(img, resolve);
        };
        img.src = dataUrl;
    });
}

function openCropModal(img, resolve) {
    const modal = document.createElement('div');
    modal.className = 'mc__crop-modal';

    const dialog = document.createElement('div');
    dialog.className = 'mc__crop-dialog';

    const title = document.createElement('h3');
    title.className = 'mc__crop-title';
    title.textContent = '裁剪图片（4:3）';

    const container = document.createElement('div');
    container.className = 'mc__crop-container';

    const cropImg = document.createElement('img');
    cropImg.className = 'mc__crop-image';
    cropImg.src = img.src;

    container.appendChild(cropImg);

    const actions = document.createElement('div');
    actions.className = 'mc__crop-actions';

    const zoomWrap = document.createElement('div');
    zoomWrap.className = 'mc__crop-zoom';

    const zoomLabel = document.createElement('span');
    zoomLabel.className = 'mc__crop-zoom-label';
    zoomLabel.textContent = '缩放';

    const zoomSlider = document.createElement('input');
    zoomSlider.className = 'mc__crop-zoom-slider';
    zoomSlider.type = 'range';
    zoomSlider.min = '100';
    zoomSlider.max = '300';
    zoomSlider.value = '100';

    zoomWrap.appendChild(zoomLabel);
    zoomWrap.appendChild(zoomSlider);

    const btns = document.createElement('div');
    btns.className = 'mc__crop-btns';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'mc__btn mc__btn--ghost';
    cancelBtn.textContent = '取消';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'mc__btn mc__btn--primary';
    confirmBtn.textContent = '确认';

    btns.appendChild(cancelBtn);
    btns.appendChild(confirmBtn);
    actions.appendChild(zoomWrap);
    actions.appendChild(btns);

    dialog.appendChild(title);
    dialog.appendChild(container);
    dialog.appendChild(actions);
    modal.appendChild(dialog);
    document.body.appendChild(modal);

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let startOffsetX = 0;
    let startOffsetY = 0;

    function updateTransform() {
        cropImg.style.width = container.clientWidth * scale + 'px';
        cropImg.style.height = container.clientHeight * scale + 'px';
        const minX = container.clientWidth - cropImg.offsetWidth;
        const minY = container.clientHeight - cropImg.offsetHeight;
        offsetX = Math.max(minX, Math.min(0, offsetX));
        offsetY = Math.max(minY, Math.min(0, offsetY));
        cropImg.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    function centerImage() {
        offsetX = (container.clientWidth - cropImg.offsetWidth) / 2;
        offsetY = (container.clientHeight - cropImg.offsetHeight) / 2;
        updateTransform();
    }

    function onZoomChange() {
        const newScale = +zoomSlider.value / 100;
        const cx = container.clientWidth / 2 - offsetX;
        const cy = container.clientHeight / 2 - offsetY;
        const ratioW = cx / (container.clientWidth * scale);
        const ratioH = cy / (container.clientHeight * scale);
        scale = newScale;
        offsetX = container.clientWidth / 2 - ratioW * container.clientWidth * scale;
        offsetY = container.clientHeight / 2 - ratioH * container.clientHeight * scale;
        updateTransform();
    }

    function onPointerDown(e) {
        dragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        startOffsetX = offsetX;
        startOffsetY = offsetY;
        e.preventDefault();
    }

    function onPointerMove(e) {
        if (!dragging) return;
        offsetX = startOffsetX + (e.clientX - dragStartX);
        offsetY = startOffsetY + (e.clientY - dragStartY);
        updateTransform();
    }

    function onPointerUp() {
        dragging = false;
    }

    zoomSlider.addEventListener('input', onZoomChange);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    function cleanup() {
        zoomSlider.removeEventListener('input', onZoomChange);
        container.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        modal.remove();
    }

    cancelBtn.addEventListener('click', () => {
        cleanup();
        resolve(null);
    });

    confirmBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = Math.round(img.naturalWidth / CROP_RATIO);
        const ctx = canvas.getContext('2d');

        const srcX = (-offsetX / (container.clientWidth * scale)) * img.naturalWidth;
        const srcY = (-offsetY / (container.clientHeight * scale)) * img.naturalHeight;
        const srcW = (container.clientWidth / (container.clientWidth * scale)) * img.naturalWidth;
        const srcH = (container.clientHeight / (container.clientHeight * scale)) * img.naturalHeight;

        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
        cleanup();
        resolve(canvas.toDataURL('image/png'));
    });

    requestAnimationFrame(() => {
        const minScaleW = container.clientWidth / img.naturalWidth;
        const minScaleH = container.clientHeight / img.naturalHeight;
        scale = Math.max(minScaleW, minScaleH);
        zoomSlider.min = String(Math.round(scale * 100));
        zoomSlider.value = zoomSlider.min;
        cropImg.onload = () => {
            centerImage();
        };
        if (cropImg.complete) {
            centerImage();
        }
    });
}
