import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { filter, switchMap, tap } from 'rxjs';

import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';
import { MatDialog } from '@angular/material/dialog';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: []
})
export class NewPageComponent implements OnInit {

  public heroForm = new FormGroup({
    id: new FormControl(''),
    superhero: new FormControl('', { nonNullable: true }),
    publisher: new FormControl<Publisher>(Publisher.DCComics),
    alter_ego: new FormControl(''),
    first_appearance: new FormControl(''),
    characters: new FormControl(''),
    alt_img: new FormControl(''),
  })

  public publishers = [
    { id: 'DC Comics', desc: 'DC - Comics' },
    { id: 'Marvel Comics', desc: 'Marvel - Comics' },
  ]

  constructor(
    private heroService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  // Convertir formulario en Héroe
  get currentHero(): Hero {
    const hero = this.heroForm.value as Hero;
    return hero;
  }

  // Cuando se inicia el componente
  ngOnInit(): void {
    if (!this.router.url.includes('edit')) return;

    this.activatedRoute.params
      .pipe(
        switchMap(({ id }) => this.heroService.getHeroesById(id)),
      ).subscribe(hero => {

        if (!hero) return this.router.navigateByUrl('/');

        this.heroForm.reset(hero);
        return;
      })
  }

  // Enviar formulario de agregar/editar Héroe
  onSubmit(): void {

    // Retornar si el formulario es inválido
    if (this.heroForm.invalid) return;

    // Actualizar héroe
    if (this.currentHero.id) {
      this.heroService.updateHero(this.currentHero)
        .subscribe(hero => {

          this.showSnackBar(`${hero.superhero} actualizado`);

        });

      return;
    }

    // Agregar nuevo héroe
    this.heroService.addHero(this.currentHero)
      .subscribe(hero => {

        this.router.navigate(['/heroes/edit', hero.id]);
        this.showSnackBar(`${hero.superhero} actualizado`);

      })
  }

  // Eliminar héroe
  onConfirmDeleteHero(): void {
    if (!this.currentHero.id) throw Error('Hero id is required');

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: this.heroForm.value
    });

    dialogRef.afterClosed()
      .pipe(
        filter((result: boolean) => result),
        switchMap(() => this.heroService.deleteHeroById(this.currentHero.id)),
        filter((wasDeleted: boolean) => wasDeleted),
      )
      .subscribe(() => {
        this.router.navigate(['/heroes']);
      })

    // dialogRef.afterClosed().subscribe(result => {
    //   if (!result) return;

    //   this.heroService.deleteHeroById(this.currentHero.id)
    //     .subscribe(wasDelete => {
    //       if (wasDelete) {
    //         this.router.navigate(['/heroes']);
    //       }
    //     })
    // })
  }

  // Mostrar mensaje para cerrar Snackbar
  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 2500 });
  }

}
