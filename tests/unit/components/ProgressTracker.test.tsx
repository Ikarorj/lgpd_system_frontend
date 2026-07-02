import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProgressTracker from "../../../src/components/ProgressTracker";
import type { UploadFileEntry } from "../../../src/types/artifact.types";

function createFile(name: string, size = 1024): File {
  return new File(["x".repeat(size)], name, { type: "application/pdf" });
}

function createEntry(
  overrides: Partial<UploadFileEntry> & { status: UploadFileEntry["status"] },
): UploadFileEntry {
  return {
    file: createFile("documento.pdf"),
    id: "entry-1",
    progress: overrides.status === "completed" ? 100 : overrides.status === "uploading" ? 50 : 0,
    ...overrides,
  };
}

describe("ProgressTracker", () => {
  it("retorna null quando a lista está vazia", () => {
    const { container } = render(<ProgressTracker files={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renderiza status pending como Aguardando", () => {
    const entry = createEntry({ status: "pending" });
    render(<ProgressTracker files={[entry]} />);
    expect(screen.getByText("Aguardando")).toBeInTheDocument();
  });

  it("renderiza status uploading com porcentagem", () => {
    const entry = createEntry({ status: "uploading", progress: 60 });
    render(<ProgressTracker files={[entry]} />);
    expect(screen.getByText("60% concluído")).toBeInTheDocument();
    expect(screen.getByText("Enviando...")).toBeInTheDocument();
  });

  it("renderiza status completed como Concluído", () => {
    const entry = createEntry({ status: "completed" });
    render(<ProgressTracker files={[entry]} />);
    expect(screen.getByText("Concluído")).toBeInTheDocument();
  });

  it("renderiza status error com mensagem de erro", () => {
    const entry = createEntry({ status: "error" });
    render(<ProgressTracker files={[entry]} />);
    expect(screen.getByText("Erro")).toBeInTheDocument();
    expect(
      screen.getByText("Erro ao processar arquivo. Tente novamente."),
    ).toBeInTheDocument();
  });

  it("renderiza tamanho do arquivo", () => {
    const entry = createEntry({ status: "completed", file: createFile("teste.pdf", 2048) });
    render(<ProgressTracker files={[entry]} />);
    expect(screen.getByText("(2.0 KB)")).toBeInTheDocument();
  });

  it("barra de progresso tem largura correta", () => {
    const entry = createEntry({ status: "uploading", progress: 75 });
    render(<ProgressTracker files={[entry]} />);
    const bar = document.querySelector('[style*="width"]');
    expect(bar).toHaveAttribute("style", "width: 75%;");
  });

  it("renderiza múltiplos arquivos", () => {
    const entries = [
      createEntry({ status: "completed", id: "e1", file: createFile("a.pdf") }),
      createEntry({ status: "pending", id: "e2", file: createFile("b.pdf") }),
    ];
    render(<ProgressTracker files={entries} />);
    expect(screen.getByText("a.pdf")).toBeInTheDocument();
    expect(screen.getByText("b.pdf")).toBeInTheDocument();
  });
});
