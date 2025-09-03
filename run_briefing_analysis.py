#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script Principal - Análise Completa do Projeto Sompo
Executa todos os scripts de análise em sequência
"""

import os
import subprocess
import sys
from datetime import datetime


def run_script(script_name, description):
    """Executa um script Python"""
    print(f"\n{'='*60}")
    print(f"🚀 EXECUTANDO: {description}")
    print(f"📄 Script: {script_name}")
    print(f"{'='*60}")

    try:
        result = subprocess.run(
            [sys.executable, script_name], capture_output=True, text=True, encoding="utf-8"
        )

        if result.returncode == 0:
            print("✅ SUCESSO!")
            print(result.stdout)
        else:
            print("❌ ERRO!")
            print(result.stderr)
            return False

    except Exception as e:
        print(f"❌ Erro ao executar {script_name}: {e}")
        return False

    return True


def main():
    """Função principal"""
    print("🎯 ANÁLISE COMPLETA DO PROJETO SOMPO SEGUROS")
    print("=" * 60)
    print(f"📅 Início: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("=" * 60)

    # Lista de scripts para executar
    scripts = [
        ("briefing_analyzer.py", "Análise Automática do Projeto"),
        ("briefing_generator.py", "Geração do Briefing Detalhado"),
        ("executive_briefing.py", "Briefing Executivo"),
        ("save_briefing.py", "Salvamento do Briefing em Arquivo"),
    ]

    success_count = 0

    for script_name, description in scripts:
        if run_script(script_name, description):
            success_count += 1
        else:
            print(f"⚠️  Script {script_name} falhou, continuando...")

    # Resumo final
    print(f"\n{'='*60}")
    print("📊 RESUMO DA EXECUÇÃO")
    print(f"{'='*60}")
    print(f"✅ Scripts executados com sucesso: {success_count}/{len(scripts)}")

    if success_count == len(scripts):
        print("🎉 TODOS OS SCRIPTS EXECUTADOS COM SUCESSO!")
        print("\n📁 ARQUIVOS GERADOS:")
        files_to_check = ["analise_sompo_briefing.json", "BRIEFING_SOMPO_EXECUTIVO.txt"]

        for file in files_to_check:
            if os.path.exists(file):
                print(f"   ✅ {file}")
            else:
                print(f"   ❌ {file} (não encontrado)")

        print(f"\n💡 PRÓXIMOS PASSOS:")
        print(f"   1. Abrir o arquivo 'BRIEFING_SOMPO_EXECUTIVO.txt'")
        print(f"   2. Usar as informações para o briefing")
        print(f"   3. Executar o sistema: npm run dev")
        print(f"   4. Abrir: frontend/index.html")
        print(f"   5. Fazer login com as credenciais fornecidas")

    else:
        print("⚠️  Alguns scripts falharam. Verifique os erros acima.")

    print(f"\n{'='*60}")
    print("🏁 ANÁLISE CONCLUÍDA!")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
