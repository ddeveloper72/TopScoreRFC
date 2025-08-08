import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameHistoryComponent } from './game-history.component';
import { MaterialModule } from '../material/material.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GameStorageService } from '../services/game-storage.service';

describe('GameHistoryComponent', () => {
  let component: GameHistoryComponent;
  let fixture: ComponentFixture<GameHistoryComponent>;
  let mockGameStorageService: jasmine.SpyObj<GameStorageService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('GameStorageService', [
      'getAllGames',
      'deleteGame',
      'clearAllGames',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        GameHistoryComponent,
        MaterialModule,
        FormsModule,
        CommonModule,
        RouterModule.forRoot([]),
      ],
      providers: [{ provide: GameStorageService, useValue: spy }],
    }).compileComponents();

    mockGameStorageService = TestBed.inject(
      GameStorageService
    ) as jasmine.SpyObj<GameStorageService>;
    fixture = TestBed.createComponent(GameHistoryComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    mockGameStorageService.getAllGames.and.returnValue([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load games on init', () => {
    component.ngOnInit();
    expect(mockGameStorageService.getAllGames).toHaveBeenCalled();
  });

  it('should filter games by search term', () => {
    const mockGames = [
      {
        id: '1',
        homeTeam: { name: 'Lions', score: 20 },
        awayTeam: { name: 'Tigers', score: 15 },
        status: 'completed' as const,
        timestamp: Date.now(),
        scoreHistory: [],
      },
    ];

    component.games = mockGames;
    component.filter.search = 'Lions';
    component.onFilterChange();

    expect(component.filteredGames.length).toBe(1);
    expect(component.filteredGames[0].homeTeam.name).toBe('Lions');
  });

  it('should calculate statistics correctly', () => {
    const mockGames = [
      {
        id: '1',
        homeTeam: { name: 'Lions', score: 20 },
        awayTeam: { name: 'Tigers', score: 15 },
        status: 'completed' as const,
        timestamp: Date.now(),
        scoreHistory: [],
      },
      {
        id: '2',
        homeTeam: { name: 'Bears', score: 10 },
        awayTeam: { name: 'Eagles', score: 25 },
        status: 'active' as const,
        timestamp: Date.now(),
        scoreHistory: [],
      },
    ];

    component.games = mockGames;
    component.calculateStatistics();

    expect(component.statistics.totalGames).toBe(2);
    expect(component.statistics.completedGames).toBe(1);
    expect(component.statistics.activeGames).toBe(1);
  });
});
