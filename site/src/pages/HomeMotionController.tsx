import { useEffect } from 'react'
import type { RefObject } from 'react'

type HomeMotionControllerProps = {
  rootRef: RefObject<HTMLDivElement | null>
}

export default function HomeMotionController({ rootRef }: HomeMotionControllerProps) {
  useEffect(() => {
    let disposed = false
    let cleanup = () => {}

    async function mountMotion() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])

      if (disposed || !rootRef.current) return

      gsap.registerPlugin(ScrollTrigger)
      const root = rootRef.current
      const media = gsap.matchMedia()
      const context = gsap.context(() => {
        const topbar = document.querySelector('.topbar--home')
        const showAtlasTopbar = () => topbar?.classList.add('topbar--atlas')
        const showHeroTopbar = () => topbar?.classList.remove('topbar--atlas')

        media.add(
          {
            motionAllowed: '(prefers-reduced-motion: no-preference)',
            desktop: '(min-width: 1025px)',
          },
          (match) => {
            const { motionAllowed, desktop } = match.conditions as {
              motionAllowed: boolean
              desktop: boolean
            }

            if (!motionAllowed) {
              ScrollTrigger.create({
                trigger: '.state-atlas',
                start: 'top top',
                end: 'bottom top',
                onEnter: showAtlasTopbar,
                onEnterBack: showAtlasTopbar,
                onLeaveBack: showHeroTopbar,
              })
              return
            }
            root.classList.add('home--gsap')

            const intro = gsap.timeline({
              defaults: { duration: 0.9, ease: 'power3.out' },
            })

            intro
              .from('.home-hero__image', { scale: 1.09, autoAlpha: 0.42, duration: 1.5 })
              .from('.home-hero__eyebrow', { y: 18, autoAlpha: 0 }, 0.16)
              .from('[data-home-line]', { yPercent: 112, stagger: 0.1 }, 0.2)
              .from('.home-hero__lead', { y: 24, autoAlpha: 0 }, 0.48)
              .from('.home-hero__actions', { y: 20, autoAlpha: 0 }, 0.58)

            gsap.to('.home-hero__image', {
              scale: 1.14,
              yPercent: 4,
              ease: 'none',
              scrollTrigger: {
                trigger: '.home-hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
              },
            })

            gsap.to('.home-hero__content', {
              yPercent: -12,
              autoAlpha: 0.18,
              ease: 'none',
              scrollTrigger: {
                trigger: '.home-hero',
                start: '45% top',
                end: 'bottom top',
                scrub: 1,
              },
            })

            if (desktop) {
              const atlas = root.querySelector<HTMLElement>('.state-atlas')
              const track = root.querySelector<HTMLElement>('.state-atlas__track')
              if (!atlas || !track) return

              const distance = () => Math.max(0, track.scrollWidth - atlas.clientWidth)
              const horizontalTween = gsap.to(track, {
                x: () => -distance(),
                ease: 'none',
                scrollTrigger: {
                  trigger: atlas,
                  start: 'top top',
                  end: () => `+=${distance()}`,
                  pin: true,
                  scrub: 1,
                  invalidateOnRefresh: true,
                  onEnter: showAtlasTopbar,
                  onEnterBack: showAtlasTopbar,
                  onLeaveBack: showHeroTopbar,
                },
              })

              gsap.utils.toArray<HTMLElement>('.family-scene').forEach((scene) => {
                const glyph = scene.querySelector('.family-scene__glyph')
                const copy = scene.querySelector('.family-scene__copy')
                gsap.from(glyph, {
                  scale: 0.7,
                  rotation: -10,
                  autoAlpha: 0.08,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: scene,
                    containerAnimation: horizontalTween,
                    start: 'left 92%',
                    end: 'left 42%',
                    scrub: 1,
                  },
                })
                gsap.from(copy, {
                  x: 72,
                  autoAlpha: 0.1,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: scene,
                    containerAnimation: horizontalTween,
                    start: 'left 88%',
                    end: 'left 48%',
                    scrub: 1,
                  },
                })
              })
            } else {
              ScrollTrigger.create({
                trigger: '.state-atlas',
                start: 'top top',
                end: 'bottom top',
                onEnter: showAtlasTopbar,
                onEnterBack: showAtlasTopbar,
                onLeaveBack: showHeroTopbar,
              })
            }
          },
        )
      }, root)

      cleanup = () => {
        root.classList.remove('home--gsap')
        document.querySelector('.topbar--home')?.classList.remove('topbar--atlas')
        media.revert()
        context.revert()
      }
    }

    void mountMotion()

    return () => {
      disposed = true
      cleanup()
    }
  }, [rootRef])

  return null
}
