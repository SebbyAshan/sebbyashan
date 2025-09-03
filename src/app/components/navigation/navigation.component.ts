import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Navigation component that displays the main navigation bar
 * Features: Navigation links with responsive design and simple active text coloring
 * Responsive design for mobile and desktop
 */
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit, OnDestroy {
  /**
   * Navigation menu items configuration
   * Each item contains display text, route path, scroll target, and active state
   */
  navigationItems = [
    { label: 'Home', path: '#home', scrollTarget: 'top', isActive: false },
    { label: 'Gallery', path: '#gallery', scrollTarget: 'gallery-section', isActive: false },
    { label: 'Services', path: '#services', scrollTarget: 'services-section', isActive: false },
    { label: 'About Me', path: '#about-me', scrollTarget: 'about-me-section', isActive: false }
  ];

  /**
   * Mobile menu toggle state
   * Controls visibility of navigation menu on mobile devices
   */
  isMobileMenuOpen = false;

  /**
   * Current active section for highlighting navigation
   */
  currentActiveSection = 'top';

  /**
   * Throttle timer for scroll event optimization
   */
  private scrollThrottle: any;

  /**
   * Component initialization
   * Sets up initial active section detection
   */
  ngOnInit(): void {
    // Set initial active section
    this.updateActiveSection();
  }

  /**
   * Component cleanup
   */
  ngOnDestroy(): void {
    if (this.scrollThrottle) {
      clearTimeout(this.scrollThrottle);
    }
  }

  /**
   * Handle window scroll events for active section detection
   * Uses throttling for performance optimization
   */
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    // Throttle scroll events for better performance
    if (this.scrollThrottle) {
      clearTimeout(this.scrollThrottle);
    }
    
    this.scrollThrottle = setTimeout(() => {
      this.updateActiveSection();
    }, 100);
  }

  /**
   * Toggles the mobile navigation menu
   * Used for responsive navigation on smaller screens
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /**
   * Handles navigation item clicks
   * Implements smooth scrolling for all sections
   * Special handling for Home button to scroll to top
   */
  onNavigationClick(item: any, event?: Event): void {
    console.log('Navigating to:', item.path);
    
    event?.preventDefault(); // Prevent default anchor behavior
    
    // Special handling for Home button - scroll to very top
    if (item.scrollTarget === 'top') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else if (item.scrollTarget) {
      // Handle other sections
      this.scrollToSection(item.scrollTarget);
    }
    
    // Close mobile menu if open
    this.isMobileMenuOpen = false;
    
    // Immediately update active state for better UX
    this.setActiveSection(item.scrollTarget);
  }

  /**
   * Scrolls smoothly to a specific section on the page
   * Enhanced to support multiple section types (class, id, or element)
   * @param sectionTarget - CSS selector for the target section
   */
  private scrollToSection(sectionTarget: string): void {
    // Try different selector approaches
    let element = document.querySelector(`#${sectionTarget}`);
    
    // If ID selector doesn't work, try class selector
    if (!element) {
      element = document.querySelector(`.${sectionTarget}`);
    }
    
    // If still not found, try direct element selector
    if (!element) {
      element = document.querySelector(sectionTarget);
    }
    
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    } else {
      console.warn(`Section with target '${sectionTarget}' not found`);
    }
  }

  /**
   * Updates the active section based on current scroll position
   * Determines which section is currently in view
   */
  private updateActiveSection(): void {
    const scrollPosition = window.scrollY;
    
    // If at the very top, set Home as active
    if (scrollPosition < 100) {
      this.setActiveSection('top');
      return;
    }

    const sections = [
      { id: 'gallery-section', element: document.querySelector('#gallery-section') },
      { id: 'services-section', element: document.querySelector('#services-section') },
      { id: 'about-me-section', element: document.querySelector('#about-me-section') }
    ];

    const viewportMiddle = window.scrollY + window.innerHeight / 2;
    let activeSection = 'top'; // Default to top

    // Find the section that's currently in view
    for (const section of sections) {
      if (section.element) {
        const rect = section.element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const elementBottom = elementTop + rect.height;

        if (viewportMiddle >= elementTop && viewportMiddle <= elementBottom) {
          activeSection = section.id;
          break;
        }
      }
    }

    // Update active section if it changed
    if (activeSection !== this.currentActiveSection) {
      this.setActiveSection(activeSection);
    }
  }

  /**
   * Sets the active section and updates navigation item states
   * @param sectionId - ID of the section to mark as active
   */
  private setActiveSection(sectionId: string): void {
    this.currentActiveSection = sectionId;
    
    // Update navigation items active state
    this.navigationItems.forEach(item => {
      item.isActive = item.scrollTarget === sectionId;
    });
  }

  /**
   * Checks if a navigation item is currently active
   * @param item - Navigation item to check
   * @returns boolean indicating if the item is active
   */
  isItemActive(item: any): boolean {
    return item.isActive;
  }
}