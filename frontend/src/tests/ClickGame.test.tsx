import { render, screen, act, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import axios from "axios";
import ClickGame from "../ClickGame";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(Math, "random").mockReturnValue(0.5); // default normal spawn
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  (Math.random as jest.Mock).mockRestore();
});

test("renders HUD with initial values", async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: { results: [{ name: "pikachu", url: "" }] },
  } as any);

  render(<ClickGame />);

  expect(await screen.findByText(/30s/)).toBeInTheDocument();
  expect(screen.getByText(/Combo: 0/)).toBeInTheDocument();
  expect(screen.getByText(/Score: 0/)).toBeInTheDocument();
});

test("spawns a pokemon after 1 second", async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: { results: [{ name: "pikachu", url: "" }] },
  } as any);

  const { container } = render(<ClickGame />);

  await act(async () => {
    jest.advanceTimersByTime(1000);
  });

  const images = container.querySelectorAll("img");
  expect(images.length).toBeGreaterThan(0);
});

test("clicking normal pokemon increases score and combo", async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: { results: [{ name: "pikachu", url: "" }] },
  } as any);

  const { container } = render(<ClickGame />);

  await act(async () => {
    jest.advanceTimersByTime(1000);
  });

  const img = container.querySelector("img")!;

  fireEvent.click(img);

  expect(screen.getByText(/Combo: 1/)).toBeInTheDocument();
  expect(screen.getByText(/Score: 1/)).toBeInTheDocument();
});

test("trap reduces score and resets combo", async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: { results: [{ name: "pikachu", url: "" }] },
  } as any);

  (Math.random as jest.Mock).mockReturnValueOnce(0.25); // trap roll

  const { container } = render(<ClickGame />);

  await act(async () => {
    jest.advanceTimersByTime(1000);
  });

  const img = container.querySelector("img")!;
  fireEvent.click(img);

  expect(screen.getByText(/Combo: 0/)).toBeInTheDocument();
  expect(screen.getByText(/Score: 0/)).toBeInTheDocument();
});

test("powerUp double doubles points", async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: { results: [{ name: "pikachu", url: "" }] },
  } as any);

  // force powerUp spawn
  (Math.random as jest.Mock)
    .mockReturnValueOnce(0.01) // spawn powerUp
    .mockReturnValueOnce(0.2); // activate double

  const { container } = render(<ClickGame />);

  await act(async () => {
    jest.advanceTimersByTime(1000);
  });

  const powerUpImg = container.querySelector("img")!;
  fireEvent.click(powerUpImg);

  expect(screen.getByText(/DOUBLE POINTS/)).toBeInTheDocument();
});

test("game over screen appears when time reaches zero", async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: { results: [{ name: "pikachu", url: "" }] },
  } as any);

  render(<ClickGame />);

  await act(async () => {
    jest.advanceTimersByTime(30000);
  });

  expect(screen.getByText(/GAME OVER/)).toBeInTheDocument();
});