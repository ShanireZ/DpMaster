import { useEffect } from 'react'
import type { RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type HomeMotionControllerProps = {
  rootRef: RefObject<HTMLDivElement | null>
}

export default function HomeMotionController({ rootRef }: HomeMotionControllerProps) {
  useEffect(() => {
    let disposed = false
    let cleanup = () => {}

    function mountMotion() {
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
                  scrub: true,
                  invalidateOnRefresh: true,
                  onEnter: showAtlasTopbar,
                  onEnterBack: showAtlasTopbar,
                  onLeaveBack: showHeroTopbar,
                },
              })

              let activePointerId: number | null = null
              let dragStartX = 0
              let dragStartScroll = 0
              let dragTargetScroll = 0
              let dragTargetProgress = 0
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
                const pointerId = activePointerId
                activePointerId = null
                if (dragMoved) {
                  window.scrollTo({
                    top: dragTargetScroll,
                    left: window.scrollX,
                    behavior: 'instant',
                  })
                  ScrollTrigger.update()
                  horizontalTween.progress(dragTargetProgress)
                }
                if (atlas.hasPointerCapture(pointerId)) {
                  atlas.releasePointerCapture(pointerId)
                }
                if (dragMoved) blockClickUntil = performance.now() + 400
                atlas.classList.remove('state-atlas--dragging')
              }
              const onPointerDown = (event: PointerEvent) => {
                if (event.pointerType === 'mouse' && event.button !== 0) return
                if (activePointerId !== null) return
                activePointerId = event.pointerId
                dragStartX = event.clientX
                window.scrollTo({
                  top: window.scrollY,
                  left: window.scrollX,
                  behavior: 'instant',
                })
                ScrollTrigger.update()
                dragStartScroll = window.scrollY
                dragTargetScroll = dragStartScroll
                const { start, end } = scrollBounds()
                dragTargetProgress = end > start
                  ? gsap.utils.clamp(0, 1, (dragStartScroll - start) / (end - start))
                  : 0
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
                const nextScroll = Math.round(
                  gsap.utils.clamp(start, end, dragStartScroll - delta),
                )
                dragTargetScroll = nextScroll
                dragTargetProgress = end > start ? (nextScroll - start) / (end - start) : 0
                horizontalTween.progress(dragTargetProgress)
              }
              const onNativeDragStart = (event: DragEvent) => {
                event.preventDefault()
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
              atlas.addEventListener('dragstart', onNativeDragStart)
              atlas.addEventListener('click', onClickCapture, true)

              return () => {
                endDrag()
                atlas.classList.remove('state-atlas--draggable', 'state-atlas--dragging')
                atlas.removeEventListener('pointerdown', onPointerDown)
                atlas.removeEventListener('pointermove', onPointerMove)
                atlas.removeEventListener('pointerup', endDrag)
                atlas.removeEventListener('pointercancel', endDrag)
                atlas.removeEventListener('lostpointercapture', endDrag)
                atlas.removeEventListener('dragstart', onNativeDragStart)
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

    mountMotion()

    return () => {
      disposed = true
      cleanup()
    }
  }, [rootRef])

  return null
}
