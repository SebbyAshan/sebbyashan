import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './components/navigation/navigation.component';
import { CommonModule } from '@angular/common';
import { HeaderParticlesComponent } from './header-particles.component';

/**
 * Root application component
 * Serves as the main container for the entire application
 * Handles hero section visibility based on scroll position
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, CommonModule, HeaderParticlesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-app';
  
  /**
   * Controls the visibility of the hero section
   * True when hero should be visible, false when hidden
   */
  isHeroVisible = true;
  
  /**
   * Current scroll opacity for smooth fade effect
   * Range: 0 (fully transparent) to 1 (fully opaque)
   */
  heroOpacity = 1;

  constructor() {}

  /**
   * Component initialization
   * Sets up initial scroll position check
   */
  ngOnInit(): void {
    // Check initial scroll position in case page is refreshed mid-scroll
    this.updateHeroVisibility(window.scrollY);
    // Start services auto-play
    this.startServicesAutoPlay();
  }

  /**
   * Component cleanup
   */
  ngOnDestroy(): void {
    // Cleanup logic can be added here if needed
  }

  /**
   * Handle window scroll events
   * Updates hero section visibility based on scroll position
   * @param event - The scroll event object
   */
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event): void {
    this.updateHeroVisibility(window.scrollY);
  }

  /**
   * Update hero section visibility and opacity based on scroll position
   * @param scrollY - Current vertical scroll position in pixels
   */
  private updateHeroVisibility(scrollY: number): void {
    const viewportHeight = window.innerHeight;
    const fadeStartPoint = viewportHeight * 0.8;
    const fadeEndPoint = viewportHeight;
    
    if (scrollY <= fadeStartPoint) {
      this.heroOpacity = 1;
      this.isHeroVisible = true;
    } else if (scrollY >= fadeEndPoint) {
      this.heroOpacity = 0;
      this.isHeroVisible = false;
    } else {
      const fadeProgress = (scrollY - fadeStartPoint) / (fadeEndPoint - fadeStartPoint);
      this.heroOpacity = 1 - fadeProgress;
      this.isHeroVisible = true;
    }
  }

  /**
   * Get dynamic styles for hero section
   * @returns Style object with opacity value
   */
  getHeroStyle(): { [key: string]: string } {
    return {
      opacity: this.heroOpacity.toString()
    };
  }

  /**
   * Gallery images configuration with metadata
   * Contains all available images from public/Image folder
   */
  galleryImages = [
    {
      src: 'Image/Anya.png',
      alt: 'Anya character artwork',
      title: 'Anya',
      description: 'Art of Anya from the game "Mouth Washing"'
    },
    {
      src: 'Image/BGFB2.png',
      alt: 'Background design 2',
      title: 'City Rain Walk',
      description: 'An Adventure into the imagination while walking in the city'
    },
    {
      src: 'Image/HideAndSeek2.png',
      alt: 'Hide and Seek game artwork',
      title: 'Hide and Seek',
      description: 'Playful story of playing Hide and Seek with Ghosts'
    },
    {
      src: 'Image/IziaFanart.png',
      alt: 'Izia fan art illustration',
      title: 'Izia Fan Art',
      description: 'Creative fan artwork for Iziarawr'
    },
    {
      src: 'Image/SpoopyStore.png',
      alt: 'Spooky store design',
      title: 'Spooky Store',
      description: 'Ghost Kid Shopping in the Store for Holloween'
    },
    {
      src: 'Image/ToshBG-1.png',
      alt: 'Tosh background design',
      title: 'Tosh Background',
      description: 'Background Art with ghost pets for Tosho'
    }
  ];

  // Modal state management
  isModalOpen = false;
  selectedImage: any = null;
  selectedImageIndex = 0;

  // Services section data and state
  services = [
    {
      id: 'stickers',
      title: 'Stickers',
      description: 'Custom stickers and emoji designs for Discord/Twitch/Other platforms',
      image: '/PanelImages/StickerPanel.png',
      alt: 'Sticker design panel'
    },
    {
      id: 'game-assets',
      title: 'Game Assets',
      description: 'Tier designs, profile frames, and game artwork',
      image: '/PanelImages/GameAssets.png',
      alt: 'Game assets panel'
    },
    {
      id: 'websites',
      title: 'Websites',
      description: 'Web designs',
      image: '/PanelImages/WebsitePanel.png',
      alt: 'Website design panel'
    }
  ];

  currentServiceIndex = 0;
  isServicesAutoPlay = true;
  private servicesInterval: any;

  /**
   * Opens the image modal and applies global size constraints
   * @param image - The image object to display
   * @param index - The index of the image in the gallery
   */
  openImageModal(image: any, index: number): void {
    this.selectedImage = image;
    this.selectedImageIndex = index;
    this.isModalOpen = true;
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Apply global size constraints after modal opens
    setTimeout(() => {
      this.enforceGlobalImageConstraints();
    }, 100);
  }

  /**
   * Enforces global image size constraints (800px width, 500px height maximum)
   * Ensures images never exceed screen boundaries or global limits
   */
  private enforceGlobalImageConstraints(): void {
    const imageContainer = document.querySelector('.modal-image-container') as HTMLElement;
    const image = document.querySelector('.modal-image') as HTMLImageElement;
    
    if (imageContainer && image) {
      // Wait for image to load
      image.onload = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Global maximum constraints
        const maxWidth = Math.min(800, viewportWidth - 80); // 800px or viewport minus padding
        const maxHeight = Math.min(500, viewportHeight - 160); // 500px or viewport minus padding
        
        // Apply constraints directly to image
        image.style.maxWidth = `${maxWidth}px`;
        image.style.maxHeight = `${maxHeight}px`;
        image.style.width = 'auto';
        image.style.height = 'auto';
        image.style.objectFit = 'contain';
        
        // Update container to match constraints
        imageContainer.style.maxWidth = `${maxWidth + 40}px`; // Add padding
        imageContainer.style.maxHeight = `${maxHeight + 40}px`; // Add padding
        
        console.log(`Image constrained to: ${maxWidth}x${maxHeight}px`);
      };
      
      // Trigger load event if image is already cached
      if (image.complete) {
        image.onload(null as any);
      }
    }
  }

  /**
   * Closes the image modal and restores normal scrolling
   */
  closeImageModal(): void {
    this.isModalOpen = false;
    this.selectedImage = null;
    // Restore body scrolling
    document.body.style.overflow = 'auto';
  }

  /**
   * Navigate to previous image in gallery
   */
  previousImage(): void {
    if (this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
      this.selectedImage = this.galleryImages[this.selectedImageIndex];
    }
  }

  /**
   * Navigate to next image in gallery
   */
  nextImage(): void {
    if (this.selectedImageIndex < this.galleryImages.length - 1) {
      this.selectedImageIndex++;
      this.selectedImage = this.galleryImages[this.selectedImageIndex];
    }
  }

  /**
   * Handle keyboard navigation in modal
   * @param event - Keyboard event
   */
  onModalKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.closeImageModal();
        break;
      case 'ArrowLeft':
        this.previousImage();
        break;
      case 'ArrowRight':
        this.nextImage();
        break;
    }
  }

  /**
   * Navigate to specific service panel
   * @param index - Index of the service to display
   */
  goToService(index: number): void {
    this.currentServiceIndex = index;
    this.resetServicesAutoPlay();
  }

  /**
   * Navigate to previous service panel
   */
  previousService(): void {
    this.currentServiceIndex = this.currentServiceIndex > 0 
      ? this.currentServiceIndex - 1 
      : this.services.length - 1;
    this.resetServicesAutoPlay();
  }

  /**
   * Navigate to next service panel
   */
  nextService(): void {
    this.currentServiceIndex = this.currentServiceIndex < this.services.length - 1 
      ? this.currentServiceIndex + 1 
      : 0;
    this.resetServicesAutoPlay();
  }

  /**
   * Start automatic service panel rotation
   */
  private startServicesAutoPlay(): void {
    if (this.isServicesAutoPlay) {
      this.servicesInterval = setInterval(() => {
        this.nextService();
      }, 4000); // Change every 4 seconds
    }
  }

  /**
   * Reset auto-play timer when user manually navigates
   */
  private resetServicesAutoPlay(): void {
    if (this.servicesInterval) {
      clearInterval(this.servicesInterval);
    }
    this.startServicesAutoPlay();
  }

  /**
   * Toggle auto-play on/off
   */
  toggleServicesAutoPlay(): void {
    this.isServicesAutoPlay = !this.isServicesAutoPlay;
    if (this.isServicesAutoPlay) {
      this.startServicesAutoPlay();
    } else if (this.servicesInterval) {
      clearInterval(this.servicesInterval);
    }
  }
}
  // In your services array, change paths like:
  // '/PanelImages/StickerPanel.png' to 'PanelImages/StickerPanel.png'
