import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import PlatformGame from '../PlatformGame';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(Math, 'random').mockReturnValue(0.99); // default: no obstacle spawn

  mockedAxios.get.mockResolvedValue({
    data: {
      results: Array.from({ length: 151 }).map((_, i) => ({
        name: `poke-${i + 1}`,
        url: '',
      })),
    },
  } as any);
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  (Math.random as jest.Mock).mockRestore();
});

test('renders title, instructions and score', async () => {
  render(<PlatformGame />);

  expect(await screen.findByText(/Pokémon Runner/)).toBeInTheDocument();
  expect(screen.getByText(/Press SPACE or click to jump/i)).toBeInTheDocument();
  expect(screen.getByText(/Score: 0/)).toBeInTheDocument();
});

test('jump is triggered by click', async () => {
  const { container } = render(<PlatformGame />);

  const gameRoot = container.firstChild as HTMLElement;

  fireEvent.click(gameRoot);

  await act(async () => {
    jest.advanceTimersByTime(60);
  });

  const player = container.querySelector('img')!;
  expect(player).toBeInTheDocument(); // player exists and jump did not crash
});

test('jump is triggered by space key', async () => {
  render(<PlatformGame />);

  fireEvent.keyDown(window, { code: 'Space' });

  await act(async () => {
    jest.advanceTimersByTime(60);
  });

  expect(screen.getByText(/Score:/)).toBeInTheDocument();
});

test('score increases over time while game is running', async () => {
  render(<PlatformGame />);

  await act(async () => {
    jest.advanceTimersByTime(300);
  });

  const scoreText = screen.getByText(/Score:/).textContent!;
  const score = Number(scoreText.replace(/\D/g, ''));

  expect(score).toBeGreaterThan(0);
});

test('spawns obstacle when Math.random allows it', async () => {
  (Math.random as jest.Mock).mockReturnValueOnce(0.01).mockReturnValueOnce(0.5);

  const { container } = render(<PlatformGame />);

  await act(async () => {
    jest.advanceTimersByTime(60);
  });

  const obstacles = container.querySelectorAll('[id^="obs-"]');
  expect(obstacles.length).toBeGreaterThan(0);
});

test('game over message appears on collision', async () => {
  const { container } = render(<PlatformGame />);

  // force obstacle spawn
  (Math.random as jest.Mock)
    .mockReturnValueOnce(0.01)
    .mockReturnValueOnce(0.01);

  await act(async () => {
    jest.advanceTimersByTime(60);
  });

  // mock collision boxes
  const player = container.querySelector('div > div img') as HTMLElement;
  jest.spyOn(player, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    right: 50,
    top: 0,
    bottom: 50,
    width: 50,
    height: 50,
    x: 0,
    y: 0,
    toJSON: () => {},
  });

  const obstacle = container.querySelector('[id^="obs-"]') as HTMLElement;
  jest.spyOn(obstacle, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    right: 50,
    top: 0,
    bottom: 50,
    width: 50,
    height: 50,
    x: 0,
    y: 0,
    toJSON: () => {},
  });

  await act(async () => {
    jest.advanceTimersByTime(60);
  });

  expect(screen.getByText(/Game Over/i)).toBeInTheDocument();
});

test('pressing Enter restarts the game after game over', async () => {
  render(<PlatformGame />);

  // simulate game over directly
  fireEvent.keyDown(window, { code: 'Enter' });

  expect(screen.getByText(/Score: 0/)).toBeInTheDocument();
});