"use client";

import { useEffect } from "react";

export function SiteEnhancements() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observedReveals = new WeakSet<Element>();
    const observedCounters = new WeakSet<Element>();
    const animationFrames = new Set<number>();
    const visibilityTimers = new Map<Element, number>();

    document.documentElement.classList.add("motion-ready");

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          const timer = visibilityTimers.get(entry.target);
          if (timer) window.clearTimeout(timer);
          visibilityTimers.delete(entry.target);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -6%", threshold: 0.08 });

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        const target = Number(element.dataset.target || 0);
        if (reduceMotion) {
          element.textContent = target.toLocaleString("fr-FR");
          counterObserver.unobserve(element);
          return;
        }
        const startedAt = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - startedAt) / 1200, 1);
          element.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3))).toLocaleString("fr-FR");
          if (progress < 1) {
            const frame = requestAnimationFrame(tick);
            animationFrames.add(frame);
          }
        };
        const frame = requestAnimationFrame(tick);
        animationFrames.add(frame);
        counterObserver.unobserve(element);
      });
    }, { threshold: 0.6 });

    const registerEnhancements = (root: ParentNode = document) => {
      root.querySelectorAll(".reveal").forEach((element) => {
        if (observedReveals.has(element)) return;
        observedReveals.add(element);
        if (reduceMotion) {
          element.classList.add("active");
          return;
        }
        element.classList.add("reveal-pending");
        revealObserver.observe(element);
        visibilityTimers.set(element, window.setTimeout(() => {
          element.classList.add("active");
          revealObserver.unobserve(element);
          visibilityTimers.delete(element);
        }, 1400));
      });

      root.querySelectorAll<HTMLElement>(".counter").forEach((element) => {
        if (observedCounters.has(element)) return;
        observedCounters.add(element);
        counterObserver.observe(element);
      });
    };

    registerEnhancements();

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(".reveal, .counter")) registerEnhancements(node.parentElement ?? document);
          else registerEnhancements(node);
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      revealObserver.disconnect();
      counterObserver.disconnect();
      mutationObserver.disconnect();
      visibilityTimers.forEach((timer) => window.clearTimeout(timer));
      animationFrames.forEach(cancelAnimationFrame);
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);
  return null;
}
