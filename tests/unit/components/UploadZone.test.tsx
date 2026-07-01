import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UploadZone from "../../../src/components/UploadZone";

const mockGetRootProps = vi.hoisted(() =>
  vi.fn(() => ({
    role: "presentation" as const,
    tabIndex: 0,
    style: {},
    className:
      "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ease-in-out border-gray-300 hover:border-primary-400 hover:bg-gray-50",
  })),
);
const mockGetInputProps = vi.hoisted(() => vi.fn(() => ({})));
const mockIsDragActive = vi.hoisted(() => vi.fn(() => false));
const mockIsDragReject = vi.hoisted(() => vi.fn(() => false));

vi.mock("react-dropzone", () => ({
  useDropzone: () => ({
    getRootProps: mockGetRootProps,
    getInputProps: mockGetInputProps,
    isDragActive: mockIsDragActive(),
    isDragReject: mockIsDragReject(),
    open: vi.fn(),
  }),
}));

describe("UploadZone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDragActive.mockReturnValue(false);
    mockIsDragReject.mockReturnValue(false);
  });

  it("renderiza texto informativo", () => {
    render(<UploadZone onFilesSelected={vi.fn()} />);
    expect(
      screen.getByText("Arraste arquivos aqui ou clique para selecionar"),
    ).toBeInTheDocument();
    expect(screen.getByText("Até 10 arquivos")).toBeInTheDocument();
  });

  it("renderiza o texto do maxFiles personalizado", () => {
    render(<UploadZone onFilesSelected={vi.fn()} maxFiles={3} />);
    expect(screen.getByText("Até 3 arquivos")).toBeInTheDocument();
  });

  it("aplica classes de desabilitado quando disabled", () => {
    render(<UploadZone onFilesSelected={vi.fn()} disabled={true} />);
    const zone = screen.getByText("Arraste arquivos aqui ou clique para selecionar")
      .closest("[role='presentation']")!;
    expect(zone.className).toContain("opacity-50");
    expect(zone.className).toContain("cursor-not-allowed");
  });

  it("mostra texto de drag ativo", () => {
    mockIsDragActive.mockReturnValue(true);
    render(<UploadZone onFilesSelected={vi.fn()} />);
    expect(screen.getByText("Solte os arquivos aqui...")).toBeInTheDocument();
  });

  it("mostra formato não suportado quando drag está ativo e rejeitado", () => {
    mockIsDragActive.mockReturnValue(true);
    mockIsDragReject.mockReturnValue(true);
    render(<UploadZone onFilesSelected={vi.fn()} />);
    expect(screen.getByText("Formato de arquivo não suportado")).toBeInTheDocument();
    expect(screen.queryByText("Solte os arquivos aqui...")).not.toBeInTheDocument();
  });
});
