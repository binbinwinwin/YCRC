import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Attraction } from '../../models/attraction.model';

@Component({
  selector: 'app-attraction-modal',
  imports: [CommonModule],
  templateUrl: './attraction-modal.html',
  styleUrl: './attraction-modal.scss',
})
export class AttractionModal {
  attraction = input.required<Attraction>();
  isFavorite = input<boolean>(false);

  addFavorite = output<void>();
  close       = output<void>();

  currentIndex = signal(0);

  images = computed(() => {
    const imgs = this.attraction().images ?? [];
    return imgs.filter((img: any) => img?.src);
  });

  prevImage(): void {
    this.currentIndex.update(i => Math.max(0, i - 1));
  }

  nextImage(): void {
    this.currentIndex.update(i => Math.min(this.images().length - 1, i + 1));
  }

  setImage(index: number): void {
    this.currentIndex.set(index);
  }

  get mapsUrl(): string {
    const { nlat, elong } = this.attraction();
    if (!nlat || !elong) return '';
    return `https://www.google.com/maps?q=${nlat},${elong}`;
  }
}
