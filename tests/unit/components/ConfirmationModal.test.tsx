import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ConfirmationModal from "../../../src/components/ConfirmationModal";

describe("ConfirmationModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza título e mensagem", () => {
    render(
      <ConfirmationModal
        title="Confirmar exclusão"
        message="Tem certeza?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("Confirmar exclusão")).toBeInTheDocument();
    expect(screen.getByText("Tem certeza?")).toBeInTheDocument();
  });

  it("chama onConfirm ao clicar em Confirmar", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmationModal
        title="Título"
        message="Mensagem"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Confirmar"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("chama onCancel ao clicar em Cancelar", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmationModal
        title="Título"
        message="Mensagem"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("chama onCancel ao clicar no overlay", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmationModal
        title="Título"
        message="Mensagem"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    const overlay = document.querySelector(".fixed.inset-0.bg-black");
    fireEvent.click(overlay!);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("chama onCancel ao clicar no botão X", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmationModal
        title="Título"
        message="Mensagem"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    const xButton = document.querySelector("button.absolute");
    fireEvent.click(xButton!);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("mostra Processando... e desabilita botões durante loading", () => {
    render(
      <ConfirmationModal
        title="Título"
        message="Mensagem"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isLoading={true}
      />,
    );
    expect(screen.getByText("Processando...")).toBeDisabled();
    expect(screen.getByText("Cancelar")).toBeDisabled();
  });

  it("aplica estilos danger", () => {
    const { container } = render(
      <ConfirmationModal
        title="Título"
        message="Mensagem"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        variant="danger"
      />,
    );
    expect(container.querySelector(".text-danger-600")).toBeInTheDocument();
  });

  it("aplica estilos info", () => {
    const { container } = render(
      <ConfirmationModal
        title="Título"
        message="Mensagem"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        variant="info"
      />,
    );
    expect(container.querySelector(".text-primary-600")).toBeInTheDocument();
  });
});
