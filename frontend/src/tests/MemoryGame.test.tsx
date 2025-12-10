import { render, screen, fireEvent, act } from "@testing-library/react";
import MemoryGame from "../MemoryGame";
import axios from "axios";

jest.mock("axios", () => ({
  get: jest.fn(),
}));

const advance = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

describe("MemoryGame", () => {
  beforeEach(() => {
    jest.useFakeTimers();

    (axios.get as any).mockResolvedValue({
      data: {
        results: Array.from({ length: 151 }, (_, i) => ({
          name: `poke${i + 1}`,
          url: `url/${i + 1}`,
        })),
      },
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test("renders title", async () => {
    await act(async () => {
      render(<MemoryGame />);
    });

    expect(screen.getByText("Memory Match")).toBeInTheDocument();
  });

  test("generates deck of even number of cards", async () => {
    await act(async () => {
      render(<MemoryGame />);
    });

    const cards = screen.getAllByRole("button", { hidden: true });
    expect(cards.length % 2).toBe(0);
  });

  test("timer starts on first flip", async () => {
    await act(async () => {
      render(<MemoryGame />);
    });

    const firstCard = screen.getAllByRole("button", { hidden: true })[0];

    expect(screen.getByText(/00:00/)).toBeInTheDocument();

    fireEvent.click(firstCard);
    await advance(3000);

    expect(screen.getByText(/00:03/)).toBeInTheDocument();
  });

  test("flipping two cards increases moves", async () => {
    await act(async () => {
      render(<MemoryGame />);
    });

    const cards = screen.getAllByRole("button", { hidden: true });

    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);

    expect(screen.getByText(/Moves:/)).toHaveTextContent("1");
  });
});
