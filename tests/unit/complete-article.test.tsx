// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CompleteArticle } from "../../src/components/complete-article";
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe("reading progress feedback", () => {
  it("requires sign-in before recording progress", () => {
    render(<CompleteArticle slug="memori-kerja" completed={false} signedIn={false} />);
    expect(screen.getByRole("link", { name: "Masuk untuk menyimpan progres" })).toHaveAttribute("href", "/masuk");
  });
  it("only marks complete after the server acknowledges persistence", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }));
    render(<CompleteArticle slug="memori-kerja" completed={false} signedIn />);
    fireEvent.click(screen.getByRole("button", { name: "Tandai sudah dipelajari" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Sudah dipelajari" })).toBeDisabled());
    expect(fetch).toHaveBeenCalledWith("/api/progress", expect.objectContaining({ method: "POST", body: JSON.stringify({ articleSlug: "memori-kerja" }) }));
  });
  it("keeps retry available and reports persistence failure", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Layanan belum siap." }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) }));
    render(<CompleteArticle slug="memori-kerja" completed={false} signedIn />);
    fireEvent.click(screen.getByRole("button", { name: "Tandai sudah dipelajari" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Layanan belum siap.");
    expect(screen.getByRole("button", { name: "Tandai sudah dipelajari" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Tandai sudah dipelajari" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Sudah dipelajari" })).toBeDisabled());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
