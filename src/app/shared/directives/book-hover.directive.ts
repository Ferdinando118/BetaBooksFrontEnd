import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'img[appBookHover]',
  standalone: true
})
export class BookHoverDirective {
  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.transform = 'scale(1.08) rotate(1deg)';
    this.el.nativeElement.style.filter = 'brightness(1.1) contrast(1.05)';
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.style.transform = 'scale(1) rotate(0deg)';
    this.el.nativeElement.style.filter = 'brightness(1) contrast(1)';
  }
}
