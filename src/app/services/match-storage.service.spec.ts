import { TestBed } from '@angular/core/testing';
import { MatchStorageService, Match } from './match-storage.service';

describe('MatchStorageService', () => {
  let service: MatchStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchStorageService);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save and retrieve matches', () => {
    const matchData: Omit<Match, 'id'> = {
      homeTeam: 'Test Home',
      awayTeam: 'Test Away',
      date: new Date(),
      venue: 'Test Venue',
      competition: 'Test Competition',
      status: 'scheduled',
    };

    const id = service.saveMatch(matchData);
    expect(id).toBeTruthy();

    const matches = service.getMatches();
    expect(matches.length).toBeGreaterThan(0);

    const savedMatch = matches.find((m) => m.id === id);
    expect(savedMatch).toBeTruthy();
    expect(savedMatch?.homeTeam).toBe('Test Home');
  });

  it('should update existing matches', () => {
    const matchData: Omit<Match, 'id'> = {
      homeTeam: 'Original Home',
      awayTeam: 'Original Away',
      date: new Date(),
      venue: 'Original Venue',
      status: 'scheduled',
    };

    const id = service.saveMatch(matchData);
    const success = service.updateMatch(id, { homeTeam: 'Updated Home' });

    expect(success).toBe(true);

    const updatedMatch = service.getMatchById(id);
    expect(updatedMatch?.homeTeam).toBe('Updated Home');
    expect(updatedMatch?.awayTeam).toBe('Original Away');
  });

  it('should delete matches', () => {
    const matchData: Omit<Match, 'id'> = {
      homeTeam: 'Test Home',
      awayTeam: 'Test Away',
      date: new Date(),
      venue: 'Test Venue',
      status: 'scheduled',
    };

    const id = service.saveMatch(matchData);
    const beforeDelete = service.getMatches().length;

    const success = service.deleteMatch(id);
    expect(success).toBe(true);

    const afterDelete = service.getMatches().length;
    expect(afterDelete).toBe(beforeDelete - 1);

    const deletedMatch = service.getMatchById(id);
    expect(deletedMatch).toBeNull();
  });

  it('should get upcoming matches only', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    // Add past match
    service.saveMatch({
      homeTeam: 'Past Home',
      awayTeam: 'Past Away',
      date: pastDate,
      venue: 'Past Venue',
      status: 'scheduled',
    });

    // Add future match
    service.saveMatch({
      homeTeam: 'Future Home',
      awayTeam: 'Future Away',
      date: futureDate,
      venue: 'Future Venue',
      status: 'scheduled',
    });

    const upcomingMatches = service.getUpcomingMatches();
    expect(upcomingMatches.length).toBeGreaterThanOrEqual(1);
    expect(upcomingMatches.every((match) => match.date >= new Date())).toBe(
      true
    );
  });

  it('should provide match statistics', () => {
    service.saveMatch({
      homeTeam: 'Test 1',
      awayTeam: 'Test 2',
      date: new Date(),
      venue: 'Venue',
      status: 'scheduled',
    });

    service.saveMatch({
      homeTeam: 'Test 3',
      awayTeam: 'Test 4',
      date: new Date(),
      venue: 'Venue',
      status: 'completed',
    });

    const stats = service.getMatchStatistics();
    expect(stats.totalMatches).toBeGreaterThanOrEqual(2);
    expect(stats.upcomingMatches).toBeGreaterThanOrEqual(1);
    expect(stats.completedMatches).toBeGreaterThanOrEqual(1);
  });
});
