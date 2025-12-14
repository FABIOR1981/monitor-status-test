#!/bin/bash
# Script: check-if-run-tests.sh
# Decide si ejecutar tests según contexto

# Saltar tests si el commit incluye [skip tests]
if [[ "$COMMIT_MESSAGE" == *"[skip tests]"* ]]; then
  echo "⏭️  Tests omitidos por mensaje de commit"
  exit 0
fi

# Saltar tests si solo cambiaron archivos de docs/
CHANGED_FILES=$(git diff --name-only HEAD~1)
if echo "$CHANGED_FILES" | grep -qvE '(\.md$|^docs/)'; then
  echo "📝 Solo cambios en documentación - omitiendo tests"
  exit 0
fi

# Ejecutar tests
echo "🧪 Ejecutando tests..."
npm run test:ci
