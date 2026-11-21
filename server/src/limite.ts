export function criarLimite(maximo: number, janelaMs: number, relogio = Date.now) {
  const clientes = new Map<string, { inicio: number; quantidade: number }>();
  return (chave: string): boolean => {
    const agora = relogio();
    for (const [id, registro] of clientes) {
      if (agora - registro.inicio >= janelaMs) clientes.delete(id);
    }
    const registro = clientes.get(chave) || { inicio: agora, quantidade: 0 };
    if (registro.quantidade >= maximo) return false;
    registro.quantidade++;
    clientes.set(chave, registro);
    return true;
  };
}
