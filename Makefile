# Makefile para gerenciar assets do projeto

.PHONY: sync-characters clean-characters copy-characters help

# Comando principal para sincronizar characters
sync-characters: clean-characters copy-characters
	@echo "Characters sincronizados com sucesso!"

# Remove a pasta characters de public/assets
clean-characters:
	@echo "Removendo pasta characters de public/assets..."
	@rm -rf public/assets/characters

# Copia a pasta characters de assets para public/assets
copy-characters:
	@echo "Copiando pasta characters de assets para public/assets..."
	@cp -r assets/characters public/assets/characters

# Mostra ajuda
help:
	@echo "Comandos disponíveis:"
	@echo "  make sync-characters  - Remove characters de public/assets e copia de assets"
	@echo "  make clean-characters - Apenas remove a pasta characters de public/assets"
	@echo "  make copy-characters  - Apenas copia characters de assets para public/assets"
	@echo "  make help            - Mostra esta ajuda"

# Comando padrão
.DEFAULT_GOAL := help
