import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-scroll-progress',
  standalone: true,
  template: `
    <div #progressBar class="scroll-progress-bar" aria-hidden="true"></div>
  `,
  styleUrls: ['./scroll-progress.component.scss'],
})
export class ScrollProgressComponent implements OnInit, OnDestroy {
  @ViewChild('progressBar', { static: true })
  progressBar!: ElementRef<HTMLElement>;
  private scrollListener?: () => void;

  ngOnInit() {
    // Check if CSS scroll-timeline is supported
    if (!CSS.supports('animation-timeline', 'scroll()')) {
      this.initJavaScriptFallback();
    }
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      const scrollContainer = document.querySelector('mat-sidenav-content');
      scrollContainer?.removeEventListener('scroll', this.scrollListener);
    }
  }

  private initJavaScriptFallback() {
    // Add class for JavaScript-controlled styling
    this.progressBar.nativeElement.classList.add('js-controlled');

    // Find the scrollable container (mat-sidenav-content)
    const scrollContainer = document.querySelector('mat-sidenav-content');

    if (scrollContainer) {
      this.scrollListener = () => {
        const scrollTop = scrollContainer.scrollTop;
        const scrollHeight =
          scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

        // Update the progress bar width
        this.progressBar.nativeElement.style.transform = `scaleX(${progress})`;
      };

      scrollContainer.addEventListener('scroll', this.scrollListener, {
        passive: true,
      });
    }
  }
}
