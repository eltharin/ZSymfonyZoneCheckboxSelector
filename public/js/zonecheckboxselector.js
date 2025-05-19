class ZoneCheckboxSelector {
    constructor(container) {
        this.container = container;
        container.zonecheckboxselector = this;
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'zonecheckboxselector';

        this.container.prepend(this.canvas);
        this.context = this.canvas.getContext("2d");
        this.isEnabled = true;
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.rect = {};
        this.resize(null);

        window.addEventListener("resize", (e) => this.resize());

        window.addEventListener("mousedown", (e) => this.startSelection(e));
        window.addEventListener("mousemove", (e) => this.updateSelection(e));
        window.addEventListener("mouseup", (e) => this.endSelection(e));

        // Gestion pour les appareils tactiles
        window.addEventListener("touchstart", (e) => this.startSelection(e.touches[0]));
        window.addEventListener("touchmove", (e) => this.updateSelection(e.touches[0]));
        window.addEventListener("touchend", (e) => this.endSelection(e.changedTouches[0]));
    }

    enable()
    {
        this.isEnabled = true;
    }

    disable()
    {
        this.isEnabled = false;
    }

    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    }

    startSelection(e) {
        if (!this.isEnabled) return;
        this.resize();
        const canvas = this.canvas.getBoundingClientRect();
        if(e.clientX >= canvas.left && e.clientX <= canvas.left + canvas.width && e.clientY >= canvas.top && e.clientY <= canvas.top + canvas.height)
        {
            this.isDrawing = true;

            this.startX = e.clientX - canvas.left;
            this.startY = e.clientY - canvas.top;

            this.rect = {};
            return false;
        }
    }

    updateSelection(e) {
        if (!this.isDrawing) return;
        this.canvas.style.zIndex = 10;
        const canvas = this.canvas.getBoundingClientRect();
        const x = Math.max(0,e.clientX - canvas.left);
        const y = Math.max(0,e.clientY - canvas.top);

        const rectStartX = Math.min(this.startX, x);
        const rectStartY = Math.min(this.startY, y);
        this.rect = {
            x: rectStartX,
            y: rectStartY,
            width: Math.min(this.canvas.width - rectStartX, Math.abs(x - this.startX)),
            height: Math.min(this.canvas.height - rectStartY, Math.abs(y - this.startY)),
        };

        // Dessin de la zone de sélection
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "rgba(0, 0, 255, 0.2)";
        this.context.fillRect(this.rect.x, this.rect.y, this.rect.width+'px', this.rect.height+'px');
        this.context.strokeStyle = "blue";
        this.context.strokeRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    }

    endSelection() {
        if (!this.isDrawing) return;

        this.isDrawing = false;
        this.canvas.style.zIndex = -1;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Vérification des cases à cocher incluses dans la zone
        const rect = this.rect;
        document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
            const boxRect = checkbox.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            const boxX = boxRect.left - canvasRect.left;
            const boxY = boxRect.top - canvasRect.top;

            if (
                boxX >= rect.x &&
                boxY >= rect.y &&
                boxX + boxRect.width <= rect.x + rect.width &&
                boxY + boxRect.height <= rect.y + rect.height
            ) {
                checkbox.checked = !checkbox.checked;
            }
        });

        this.startX = 0;
        this.startY = 0;
        this.rect = {};
    }
}

//export default ZoneCheckboxSelector;