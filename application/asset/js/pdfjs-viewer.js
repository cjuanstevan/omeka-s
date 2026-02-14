(function() {
    function renderViewer(container) {
        var pdfUrl = container.getAttribute('data-src');
        if (!pdfUrl || !window.pdfjsLib) {
            return;
        }

        if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.worker.min.js';
        }

        var canvas = container.querySelector('canvas');
        var ctx = canvas.getContext('2d');
        var prevBtn = container.querySelector('[data-pdfjs-prev]');
        var nextBtn = container.querySelector('[data-pdfjs-next]');
        var pageNumEl = container.querySelector('[data-pdfjs-page-num]');
        var pageCountEl = container.querySelector('[data-pdfjs-page-count]');
        var errorEl = container.querySelector('[data-pdfjs-error]');

        var pdfDoc = null;
        var pageNum = 1;
        var pageRendering = false;
        var pageNumPending = null;
        var scale = parseFloat(container.getAttribute('data-scale') || '1.25');

        function renderPage(num) {
            pageRendering = true;
            pdfDoc.getPage(num).then(function(page) {
                var viewport = page.getViewport({ scale: scale });
                var outputScale = window.devicePixelRatio || 1;

                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                canvas.style.width = Math.floor(viewport.width) + 'px';
                canvas.style.height = Math.floor(viewport.height) + 'px';

                var transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

                var renderContext = {
                    canvasContext: ctx,
                    transform: transform,
                    viewport: viewport
                };

                var renderTask = page.render(renderContext);
                return renderTask.promise;
            }).then(function() {
                pageRendering = false;
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
                if (pageNumEl) {
                    pageNumEl.textContent = pageNum;
                }
            }).catch(function(err) {
                pageRendering = false;
                if (errorEl) {
                    errorEl.textContent = 'Failed to render PDF.';
                }
                if (window.console && console.error) {
                    console.error(err);
                }
            });
        }

        function queueRenderPage(num) {
            if (pageRendering) {
                pageNumPending = num;
            } else {
                renderPage(num);
            }
        }

        function onPrevPage() {
            if (pageNum <= 1) {
                return;
            }
            pageNum--;
            queueRenderPage(pageNum);
        }

        function onNextPage() {
            if (pageNum >= pdfDoc.numPages) {
                return;
            }
            pageNum++;
            queueRenderPage(pageNum);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', onPrevPage);
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', onNextPage);
        }

        window.pdfjsLib.getDocument(pdfUrl).promise.then(function(pdf) {
            pdfDoc = pdf;
            if (pageCountEl) {
                pageCountEl.textContent = pdfDoc.numPages;
            }
            renderPage(pageNum);
        }).catch(function(err) {
            if (errorEl) {
                errorEl.textContent = 'Failed to load PDF.';
            }
            if (window.console && console.error) {
                console.error(err);
            }
        });
    }

    function init() {
        var viewers = document.querySelectorAll('.pdfjs-viewer');
        if (!viewers.length) {
            return;
        }
        if (!window.pdfjsLib) {
            return;
        }
        for (var i = 0; i < viewers.length; i++) {
            renderViewer(viewers[i]);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
