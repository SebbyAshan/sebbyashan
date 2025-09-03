import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit, Component, ElementRef, HostListener, inject,
  input, NgZone, OnDestroy, PLATFORM_ID, ViewChild
} from '@angular/core';
import { Container, IDelta, InteractivityDetect, IParticleUpdater, MoveDirection, Particle, tsParticles } from "@tsparticles/engine";
import { loadBasic } from "@tsparticles/basic";
import { loadExternalPushInteraction } from "@tsparticles/interaction-external-push";
import { loadParticlesLinksInteraction } from "@tsparticles/interaction-particles-links";
import { loadExternalRepulseInteraction } from "@tsparticles/interaction-external-repulse";
import { IImage, loadImageShape } from '@tsparticles/shape-image';


// tell typescript that there's some new fields on that type so that we can actually configure stuff...
declare module "@tsparticles/shape-image" {
  interface IImage {
    rockerSmooth?: { enabled?: boolean; minDeg?: number; maxDeg?: number; periodSec?: number };
    rockerStep?: { enabled?: boolean; lowDeg?: number; highDeg?: number; holdSec?: number };
  }
}

/**
 * Header particles component for TSParticles integration
 * Provides interactive particle effects with responsive design
 * Uses direct TSParticles engine API for maximum control
 * Features custom leaf image particles with enhanced visual appeal and custom rotation effects
 */
@Component({
  selector: 'app-header-particles',
  templateUrl: './header-particles.component.html',
  styleUrls: ['./header-particles.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class HeaderParticlesComponent implements AfterViewInit, OnDestroy {
  // inputs
  class = input<string | string[] | { [classes: string]: boolean }>('');

  // refs
  @ViewChild('tsparticles', { static: true }) tsparticles!: ElementRef<HTMLCanvasElement>;

  // internals
  private container: Container | null = null;
  private initPromise: Promise<Container | null> | null = null;
  private destroyed = false;
  private resizeRaf: number | null = null;

  // values
  private platformId = inject(PLATFORM_ID);

  // services
  private zone = inject(NgZone);

  /**
   * Enable custom particle updaters for enhanced rotation effects
   * Adds smooth rocking motion and step-based rotation animations
   */
  async enableFeatures() {
    await tsParticles.addParticleUpdater("rockerSmooth", async () => {
      return {
        init() { },
        isEnabled: (p: Particle) => !!(p.shapeData as IImage | undefined)?.rockerSmooth?.enabled,
        update(p: Particle, delta: IDelta) {
          if (!(this as IParticleUpdater).isEnabled(p)) return;
          const img = p.shapeData as IImage | undefined;
          const cfg = img?.rockerSmooth ?? {};
          const a0 = cfg.minDeg ?? 0;
          const a1 = cfg.maxDeg ?? 30;
          const period = cfg.periodSec ?? 4;

          const center = (a0 + a1) / 2;
          const amp = (a1 - a0) / 2;

          const st = ((p as any).__rock ??= { t: Math.random() * period });
          st.t += delta.value / 1000;
          const omega = (2 * Math.PI) / period;
          const deg = center + amp * Math.sin(omega * st.t);

          p.rotation = (deg * Math.PI) / 180;
        }
      };
    });

    await tsParticles.addParticleUpdater("rockerStep", async () => {
      return {
        init() { },
        isEnabled: (p: Particle) => !!(p.shapeData as IImage | undefined)?.rockerStep?.enabled,
        update(p: Particle, delta: IDelta) {
          if (!(this as IParticleUpdater).isEnabled(p)) return;
          const img = p.shapeData as IImage | undefined;
          const cfg = img?.rockerStep ?? {};
          const aLow = cfg.lowDeg ?? 0;
          const aHigh = cfg.highDeg ?? 30;
          const hold = cfg.holdSec ?? 2;

          const st = ((p as any).__rockStep ??= { t: 0 });
          st.t += delta.value / 1000;

          const cycle = 2 * hold;
          const phase = st.t % cycle;
          const deg = phase < hold ? aLow : aHigh;

          p.rotation = (deg * Math.PI) / 180;
        }
      };
    });
  }

  /**
   * Initialize TSParticles after view initialization
   * Runs outside Angular zone for optimal performance
   * Includes comprehensive error handling and responsive configuration
   * Features custom leaf image particles with interactive effects and enhanced rotation
   */
  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.initPromise) return;

    this.initPromise = this.zone.runOutsideAngular(async () => {
      try {
        await loadBasic(tsParticles);
        await loadImageShape(tsParticles);
        await loadExternalPushInteraction(tsParticles);
        await loadExternalRepulseInteraction(tsParticles);
        await loadParticlesLinksInteraction(tsParticles);
        await this.enableFeatures();

        // abort early
        if (this.destroyed) return null;

        const container = await tsParticles.load({
          element: this.tsparticles.nativeElement,
          options: {
            background: {
              color: {
                value: 'transparent',
              },
            },
            fpsLimit: 120,
            interactivity: {
              detectsOn: InteractivityDetect.window,
              events: {
                onClick: {
                  enable: false,
                  mode: 'push',
                },
                onHover: {
                  enable: true,
                  mode: 'repulse',
                },
                resize: {
                  enable: true,
                },
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: ['#ffffff', '#a48770', '#1c1511'],
              },
              move: {
                direction: MoveDirection.bottomLeft,
                enable: true,
                random: false,
                speed: 1,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                },
                value: 50,
              },
              shape: {
                type: 'image',
                options: {
                  image: {
                    src: '/Particles/Leaf-GIF.gif',
                    width: 100,
                    height: 100,
                    rockerSmooth: {enabled: true, minDeg: 0, maxDeg: 25, periodSec: 3 }
                  }
                }
              },
              size: {
                value: { min: 30, max: 60 },
                animation: {
                  enable: true,
                  speed: 2,
                  sync: false,
                },
              },
              rotate: {
                value: 0,
                random: true,
                direction: "clockwise",
                animation: {
                  enable: true,
                  speed: 10,
                  sync: false
                }
              }
            },
            detectRetina: true,
            responsive: [
              {
                maxWidth: 768,
                options: {
                  particles: {
                    number: {
                      value: 25,
                    },
                    move: {
                      speed: 0.5,
                    },
                    size: {
                      value: { min: 8, max: 20 },
                    },
                  },
                },
              },
              {
                maxWidth: 480,
                options: {
                  particles: {
                    number: {
                      value: 15,
                    },
                    links: {
                      enable: false,
                    },
                    size: {
                      value: { min: 6, max: 15 },
                    },
                  },
                },
              },
            ],
          }
        });

        if (this.destroyed) {
          // if somehow the component ends up already destroyed at this point, do immediate clean-up in hopes of preventing odd race conditions
          container?.destroy();
          return null;
        }

        this.container = container ?? null;
        this.container?.play();

        return this.container;
      } catch (err) {
        console.error('tsParticles init failed:', err);
        return null;
      }
    });

    await this.initPromise; // awaiting should keep hook tidy
  }

  /**
   * Handle window resize events with throttling
   * Refreshes particle container to maintain proper scaling
   */
  @HostListener('window:resize')
  onWindowResized() {
    // throttle refresh to one per frame
    if (!this.container) return;
    if (this.resizeRaf !== null) return;

    this.resizeRaf = this.zone.runOutsideAngular(() =>
      requestAnimationFrame(() => {
        this.resizeRaf = null;
        this.container?.refresh();
      })
    );
  }

  /**
   * Clean up resources on component destruction
   * Prevents memory leaks and race conditions
   */
  ngOnDestroy(): void {
    this.destroyed = true;

    // cancel any pending RAF
    if (this.resizeRaf !== null) {
      cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = null;
    }

    // if container exists, stop and destroy it
    try {
      this.container?.stop();
      this.container?.destroy();
    } catch (e) {
      // ignore
    } finally {
      this.container = null;
    }

    // the inflight case is guarded above by checking for this.destroyed, so we should be ok
  }
}
