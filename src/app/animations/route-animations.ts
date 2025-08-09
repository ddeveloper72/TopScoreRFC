import {
  trigger,
  transition,
  style,
  query,
  group,
  animateChild,
  animate,
  keyframes,
} from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  // Slide transition for most routes
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 0,
        transform: 'translateX(100px)',
      })
    ], { optional: true }),
    query(':enter', [
      animate('300ms ease-in', style({ 
        opacity: 1, 
        transform: 'translateX(0)' 
      }))
    ], { optional: true }),
    query(':leave', [
      animate('300ms ease-out', style({ 
        opacity: 0, 
        transform: 'translateX(-100px)' 
      }))
    ], { optional: true }),
  ]),

  // Special fade transition for dashboard
  transition('* <=> Dashboard', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'scale(0.95)' }),
      animate('400ms ease-in', style({ 
        opacity: 1, 
        transform: 'scale(1)' 
      }))
    ], { optional: true }),
    query(':leave', [
      animate('300ms ease-out', style({ 
        opacity: 0,
        transform: 'scale(1.05)' 
      }))
    ], { optional: true }),
  ]),

  // Smooth slide for score tracker
  transition('* <=> ScoreTracker', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(30px)' }),
      animate('350ms cubic-bezier(0.35, 0, 0.25, 1)', style({ 
        opacity: 1, 
        transform: 'translateY(0)' 
      }))
    ], { optional: true }),
    query(':leave', [
      animate('250ms ease-out', style({ 
        opacity: 0,
        transform: 'translateY(-30px)' 
      }))
    ], { optional: true }),
  ]),

  // Calendar specific animation
  transition('* <=> Calendar', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'rotateX(-10deg) translateY(20px)' }),
      animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', style({ 
        opacity: 1, 
        transform: 'rotateX(0deg) translateY(0)' 
      }))
    ], { optional: true }),
    query(':leave', [
      animate('300ms ease-out', style({ 
        opacity: 0,
        transform: 'rotateX(10deg) translateY(-20px)' 
      }))
    ], { optional: true }),
  ])
]);

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('200ms ease-out', style({ opacity: 0, transform: 'translateY(-20px)' }))
  ])
]);

export const slideInFromBottom = trigger('slideInFromBottom', [
  transition(':enter', [
    style({ transform: 'translateY(100%)', opacity: 0 }),
    animate('300ms cubic-bezier(0.35, 0, 0.25, 1)', 
      style({ transform: 'translateY(0)', opacity: 1 })
    )
  ])
]);

export const staggerAnimation = trigger('stagger', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('300ms {{delay}}ms ease-out', 
        style({ opacity: 1, transform: 'translateY(0)' })
      )
    ], { optional: true })
  ])
]);
