# AD Palpite Premiado — Cloudflare Pages + D1

Sistema online com página pública e painel `/admin.html`.

## Regras implementadas
- 2 jogos por rodada.
- Um participante pode ter o mesmo placar de outra pessoa em 1 jogo.
- A combinação completa dos 2 placares é única.
- O mesmo WhatsApp altera o próprio palpite enquanto estiver aberto.
- Bloqueio manual e encerramento automático.
- Painel ADM com jogos, escudos, prêmio, horários, participantes e conferência de ganhador.

## Publicação
1. Instale Node.js no computador e extraia este projeto.
2. No terminal dentro da pasta: `npx wrangler login`
3. Crie o banco: `npx wrangler d1 create ad-palpite-db`
4. Crie o projeto Pages: `npx wrangler pages project create ad-palpite-premiado`
5. No Cloudflare Dashboard, abra o projeto > Settings > Bindings > Add > D1 database. Use o nome **DB** e selecione `ad-palpite-db`.
6. Em Settings > Variables and Secrets, crie um Secret chamado **ADMIN_PASSWORD** com a senha que você quiser para o painel.
7. Crie as tabelas no banco remoto: `npx wrangler d1 execute ad-palpite-db --remote --file=./schema.sql`
8. Publique (é importante usar Wrangler porque o projeto usa Pages Functions): `npx wrangler pages deploy public --project-name ad-palpite-premiado`
9. Abra `https://ad-palpite-premiado.pages.dev/` e o painel em `/admin.html`.

Se o nome do projeto já estiver ocupado, use outro nome no passo 4 e também no comando do passo 8.

## Jogos dinâmicos
Esta versão permite adicionar/remover jogos no painel ADM (de 1 até 20 por rodada). A combinação completa de todos os palpites deve ser única por participante.
