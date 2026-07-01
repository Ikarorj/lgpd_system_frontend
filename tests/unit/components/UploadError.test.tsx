import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import UploadError from "../../../src/components/UploadError";

describe("UploadError", () => {
  it("renderiza mensagem de erro", () => {
    render(<UploadError message="Arquivo muito grande" />);
    expect(screen.getByText("Arquivo muito grande")).toBeInTheDocument();
    expect(screen.getByText("Erro no upload")).toBeInTheDocument();
  });

  it("mostra botão Tentar novamente quando onRetry é fornecido", () => {
    const onRetry = vi.fn();
    render(<UploadError message="Erro" onRetry={onRetry} />);
    const btn = screen.getByText("Tentar novamente");
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("não mostra botão Tentar novamente quando onRetry não é fornecido", () => {
    render(<UploadError message="Erro" />);
    expect(screen.queryByText("Tentar novamente")).not.toBeInTheDocument();
  });

  it("mostra botão X quando onDismiss é fornecido", () => {
    const onDismiss = vi.fn();
    render(<UploadError message="Erro" onDismiss={onDismiss} />);
    const dismissBtn = document.querySelector(".text-danger-400");
    expect(dismissBtn).toBeInTheDocument();
    fireEvent.click(dismissBtn!);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("não mostra botão X quando onDismiss não é fornecido", () => {
    render(<UploadError message="Erro" />);
    expect(document.querySelector(".text-danger-400")).not.toBeInTheDocument();
  });
});
