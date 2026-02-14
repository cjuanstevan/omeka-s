<?php
namespace Omeka\Media\FileRenderer;

use Laminas\View\Renderer\PhpRenderer;
use Omeka\Api\Representation\MediaRepresentation;

class PdfRenderer extends AbstractRenderer
{
    public function render(PhpRenderer $view, MediaRepresentation $media, array $options = [])
    {
        $view->headScript()->appendFile('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.min.js');
        $view->headScript()->appendFile($view->assetUrl('js/pdfjs-viewer.js', 'Omeka', true));
        $view->headLink()->appendStylesheet($view->assetUrl('css/pdfjs-viewer.css', 'Omeka'));

        return $view->partial('common/pdfjs-viewer', [
            'media' => $media,
            'options' => $options,
        ]);
    }
}
