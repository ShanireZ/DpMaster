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

            gsap.fromTo(
              '.home-hero__image',
              { scale: 1, yPercent: 0 },
              {
                scale: 1.14,
                yPercent: 4,
                ease: 'none',
                scrollTrigger: {
                  trigger: '.home-hero',
                  start: 'top top',
                  end: 'bottom top',
                  scrub: 1,
                },
              },
            )

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

              let activePointerId: number | null = null
              let dragStartX = 0
              let dragStartScroll = 0
              let dragMoved = false
              let blockClickUntil = 0

              const scrollBounds = () => {
                const trigger = horizontalTween.scrollTrigger
                return {
                  start: Number(trigger?.start ?? 0),
                  end: Number(trigger?.end ?? distance()),
                }
              }
              const endDrag = (event?: PointerEvent) => {
                if (activePointerId === null) return
                if (event && event.pointerId !== activePointerId) return
                if (atlas.hasPointerCapture(activePointerId)) {
                  atlas.releasePointerCapture(activePointerId)
                }
                if (dragMoved) blockClickUntil = performance.now() + 400
                activePointerId = null
                atlas.classList.remove('state-atlas--dragging')
              }
              const onPointerDown = (event: PointerEvent) => {
                if (event.pointerType === 'mouse' && event.button !== 0) return
                activePointerId = event.pointerId
                dragStartX = event.clientX
                dragStartScroll = window.scrollY
                dragMoved = false
                atlas.setPointerCapture(event.pointerId)
                atlas.classList.add('state-atlas--dragging')
              }
              const onPointerMove = (event: PointerEvent) => {
                if (event.pointerId !== activePointerId) return
                const delta = event.clientX - dragStartX
                if (!dragMoved && Math.abs(delta) < 6) return
                dragMoved = true
                event.preventDefault()

                const { start, end } = scrollBounds()
                const nextScroll = gsap.utils.clamp(start, end, dragStartScroll - delta * 1.25)
                const progress = end > start ? (nextScroll - start) / (end - start) : 0
                window.scrollTo({ top: nextScroll, behavior: 'auto' })
                horizontalTween.progress(progress)
                ScrollTrigger.update()
              }
              const onClickCapture = (event: MouseEvent) => {
                if (performance.now() > blockClickUntil) return
                event.preventDefault()
                event.stopPropagation()
                blockClickUntil = 0
              }

              atlas.classList.add('state-atlas--draggable')
              atlas.addEventListener('pointerdown', onPointerDown)
              atlas.addEventListener('pointermove', onPointerMove)
              atlas.addEventListener('pointerup', endDrag)
              atlas.addEventListener('pointercancel', endDrag)
              atlas.addEventListener('lostpointercapture', endDrag)
              atlas.addEventListener('click', onClickCapture, true)

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

              return () => {
                endDrag()
                atlas.classList.remove('state-atlas--draggable', 'state-atlas--dragging')
                atlas.removeEventListener('pointerdown', onPointerDown)
                atlas.removeEventListener('pointermove', onPointerMove)
                atlas.removeEventListener('pointerup', endDrag)
                atlas.removeEventListener('pointercancel', endDrag)
                atlas.removeEventListener('lostpointercapture', endDrag)
                atlas.removeEventListener('click', onClickCapture, true)
              }
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
