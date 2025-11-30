import html2canvas from 'html2canvas';

export const downloadElementAsPNG = async (elementId: string, fileName: string) => {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // 1. Clone the node
    // We clone just the specific face (Front or Back) requested by ID.
    const clonedElement = originalElement.cloneNode(true) as HTMLElement;

    // 2. Setup Off-screen Container
    // This container enforces the correct dimensions for the card.
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '-9999px';
    container.style.width = '320px'; // Explicit card width
    container.style.height = '480px'; // Explicit card height
    container.style.zIndex = '-9999';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);

    // 3. Reset Styles for Flat Capture
    // We override transform styles to ensure the card renders flat (2D) and face-up.
    // This fixes the "Mirrored Text" issue on the back card.
    clonedElement.style.setProperty('transform', 'none', 'important');
    clonedElement.style.setProperty('perspective', 'none', 'important');
    clonedElement.style.setProperty('transform-style', 'flat', 'important');
    clonedElement.style.setProperty('box-shadow', 'none', 'important');
    clonedElement.style.setProperty('transition', 'none', 'important');
    clonedElement.style.setProperty('margin', '0', 'important');
    clonedElement.style.width = '100%';
    clonedElement.style.height = '100%';
    
    // Ensure visibility (fix for backface-hidden causing invisible renders if parent was flipped)
    clonedElement.style.setProperty('backface-visibility', 'visible', 'important');
    clonedElement.style.setProperty('visibility', 'visible', 'important');
    clonedElement.style.setProperty('opacity', '1', 'important');
    
    // 4. Clean Class Names
    // Remove Tailwind classes that apply 3D rotations or animations
    const classesToRemove = [
        'rotate-y-180', // Fixes mirroring
        'flip-transition', 
        'backface-hidden', 
        'transform-style-3d', 
        'perspective-1000',
        'group', 
        'hover:scale-105'
    ];
    
    classesToRemove.forEach(cls => {
        if (clonedElement.classList.contains(cls)) {
            clonedElement.classList.remove(cls);
        }
    });

    // Remove any dynamic animation classes
    let newClassName = clonedElement.className;
    newClassName = newClassName.replace(/animate-[\w-]+/g, '');
    clonedElement.className = newClassName.trim();

    // Ensure images have crossOrigin set to allow canvas capture
    const images = clonedElement.getElementsByTagName('img');
    for (let i = 0; i < images.length; i++) {
      images[i].crossOrigin = "anonymous";
    }
    
    container.appendChild(clonedElement);

    // 5. Wait for content to settle (fonts/images)
    await new Promise(resolve => setTimeout(resolve, 300));

    // 6. Capture
    const canvas = await html2canvas(clonedElement, {
      backgroundColor: null, // Preserves rounded corners transparency
      scale: 5, // High resolution (5x) for professional print quality
      logging: false,
      useCORS: true, // Vital for external images
      allowTaint: true,
      width: 320,
      height: 480,
      windowWidth: 1920,
    });

    // 7. Cleanup
    document.body.removeChild(container);

    // 8. Download
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png', 1.0);
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading image:', error);
  }
};