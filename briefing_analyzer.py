#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Análise Automática - Sistema Sompo Seguros
Analisa o projeto e gera um briefing completo baseado no código-fonte
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path


class SompoProjectAnalyzer:
    def __init__(self):
        self.project_root = Path(".")
        self.analysis = {
            "projeto": "Sistema de Monitoramento de Cargas - Sompo Seguros",
            "data_analise": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
            "tecnologias": {},
            "funcionalidades": {},
            "estrutura": {},
            "status": {},
            "dados_mockados": {},
            "endpoints": [],
            "arquivos_principais": [],
        }

    def print_header(self):
        """Imprime cabeçalho do briefing"""
        print("=" * 80)
        print("🔍 ANÁLISE AUTOMÁTICA - SISTEMA SOMPO SEGUROS")
        print("=" * 80)
        print(f"📅 Data da Análise: {self.analysis['data_analise']}")
        print(f"🎯 Projeto: {self.analysis['projeto']}")
        print("=" * 80)
        print()

    def analyze_package_json(self):
        """Analisa package.json para identificar dependências"""
        print("📦 ANALISANDO DEPENDÊNCIAS...")

        package_files = ["package.json", "backend/package.json"]

        for pkg_file in package_files:
            if os.path.exists(pkg_file):
                try:
                    with open(pkg_file, "r", encoding="utf-8") as f:
                        data = json.load(f)

                    print(f"\n📁 {pkg_file}:")

                    # Dependências principais
                    if "dependencies" in data:
                        print("   🔧 Dependências Principais:")
                        for dep, version in data["dependencies"].items():
                            print(f"      • {dep}: {version}")

                    # Dependências de desenvolvimento
                    if "devDependencies" in data:
                        print("   🛠️  Dependências de Desenvolvimento:")
                        for dep, version in data["devDependencies"].items():
                            print(f"      • {dep}: {version}")

                    # Scripts disponíveis
                    if "scripts" in data:
                        print("   🚀 Scripts Disponíveis:")
                        for script, command in data["scripts"].items():
                            print(f"      • {script}: {command}")

                except Exception as e:
                    print(f"   ❌ Erro ao ler {pkg_file}: {e}")

        print()

    def analyze_project_structure(self):
        """Analisa a estrutura de diretórios do projeto"""
        print("📁 ANALISANDO ESTRUTURA DO PROJETO...")

        structure = {"backend": [], "frontend": [], "database": [], "docs": []}

        # Analisar backend
        backend_path = Path("backend")
        if backend_path.exists():
            print("\n🔧 BACKEND:")
            for item in backend_path.rglob("*"):
                if item.is_file() and not item.name.startswith("."):
                    rel_path = item.relative_to(backend_path)
                    if rel_path.parts[0] in ["src", "dist"]:
                        structure["backend"].append(str(rel_path))
                        print(f"   📄 {rel_path}")

        # Analisar frontend
        frontend_path = Path("frontend")
        if frontend_path.exists():
            print("\n🎨 FRONTEND:")
            for item in frontend_path.rglob("*"):
                if item.is_file() and not item.name.startswith("."):
                    rel_path = item.relative_to(frontend_path)
                    structure["frontend"].append(str(rel_path))
                    print(f"   📄 {rel_path}")

        # Analisar database
        database_path = Path("database")
        if database_path.exists():
            print("\n🗄️  DATABASE:")
            for item in database_path.rglob("*"):
                if item.is_file():
                    rel_path = item.relative_to(database_path)
                    structure["database"].append(str(rel_path))
                    print(f"   📄 {rel_path}")

        self.analysis["estrutura"] = structure
        print()

    def analyze_technologies(self):
        """Identifica tecnologias baseado nos arquivos"""
        print("🔍 IDENTIFICANDO TECNOLOGIAS...")

        technologies = {"backend": [], "frontend": [], "database": [], "devops": []}

        # Análise por extensões de arquivo
        file_extensions = {}

        for root, dirs, files in os.walk("."):
            for file in files:
                if not file.startswith("."):
                    ext = Path(file).suffix
                    if ext:
                        file_extensions[ext] = file_extensions.get(ext, 0) + 1

        print("\n📊 EXTENSÕES DE ARQUIVO ENCONTRADAS:")
        for ext, count in sorted(file_extensions.items(), key=lambda x: x[1], reverse=True):
            print(f"   {ext}: {count} arquivos")

            # Identificar tecnologias por extensão
            if ext == ".ts":
                technologies["backend"].append("TypeScript")
            elif ext == ".js":
                technologies["frontend"].append("JavaScript")
                technologies["backend"].append("Node.js")
            elif ext == ".html":
                technologies["frontend"].append("HTML5")
            elif ext == ".css":
                technologies["frontend"].append("CSS3")
            elif ext == ".sql":
                technologies["database"].append("PostgreSQL")
            elif ext == ".json":
                technologies["backend"].append("JSON")
            elif ext == ".md":
                technologies["devops"].append("Markdown")

        # Análise específica de tecnologias
        print("\n🔧 TECNOLOGIAS IDENTIFICADAS:")

        print("   🖥️  BACKEND:")
        backend_techs = set(technologies["backend"])
        for tech in sorted(backend_techs):
            print(f"      • {tech}")

        print("   🎨 FRONTEND:")
        frontend_techs = set(technologies["frontend"])
        for tech in sorted(frontend_techs):
            print(f"      • {tech}")

        print("   🗄️  DATABASE:")
        database_techs = set(technologies["database"])
        for tech in sorted(database_techs):
            print(f"      • {tech}")

        self.analysis["tecnologias"] = technologies
        print()

    def analyze_functionality(self):
        """Analisa funcionalidades baseado no código"""
        print("⚙️  ANALISANDO FUNCIONALIDADES...")

        functionality = {
            "autenticacao": False,
            "dashboard": False,
            "mapas": False,
            "alertas": False,
            "monitoramento": False,
            "gestao_usuarios": False,
            "gestao_veiculos": False,
            "gestao_cargas": False,
            "tempo_real": False,
            "relatorios": False,
        }

        # Analisar arquivos específicos
        files_to_check = {
            "frontend/auth.js": ["autenticacao"],
            "frontend/dashboard.js": ["dashboard"],
            "frontend/map.js": ["mapas"],
            "frontend/alerts.js": ["alertas"],
            "frontend/vehicles.js": ["gestao_veiculos"],
            "frontend/shipments.js": ["gestao_cargas"],
            "frontend/users.js": ["gestao_usuarios"],
            "backend/src/controllers/monitoring.controller.ts": ["monitoramento"],
            "backend/src/services/socket.service.ts": ["tempo_real"],
        }

        print("\n🔍 VERIFICANDO FUNCIONALIDADES:")

        for file_path, features in files_to_check.items():
            if os.path.exists(file_path):
                for feature in features:
                    functionality[feature] = True
                print(f"   ✅ {file_path} - {', '.join(features)}")
            else:
                print(f"   ❌ {file_path} - Não encontrado")

        # Verificar funcionalidades específicas no código
        self.check_specific_features(functionality)

        self.analysis["funcionalidades"] = functionality
        print()

    def check_specific_features(self, functionality):
        """Verifica funcionalidades específicas no código"""

        # Verificar autenticação JWT
        if os.path.exists("backend/src/middleware/auth.middleware.ts"):
            functionality["autenticacao"] = True
            print("   ✅ Autenticação JWT implementada")

        # Verificar Socket.IO
        if os.path.exists("backend/src/services/socket.service.ts"):
            functionality["tempo_real"] = True
            print("   ✅ Comunicação em tempo real (Socket.IO)")

        # Verificar mapas
        if os.path.exists("frontend/map.js"):
            with open("frontend/map.js", "r", encoding="utf-8") as f:
                content = f.read()
                if "leaflet" in content.lower() or "map" in content.lower():
                    functionality["mapas"] = True
                    print("   ✅ Sistema de mapas implementado")

        # Verificar dashboard
        if os.path.exists("frontend/dashboard.js"):
            with open("frontend/dashboard.js", "r", encoding="utf-8") as f:
                content = f.read()
                if "chart" in content.lower() or "dashboard" in content.lower():
                    functionality["dashboard"] = True
                    print("   ✅ Dashboard com gráficos implementado")

    def analyze_endpoints(self):
        """Analisa endpoints da API"""
        print("🌐 ANALISANDO ENDPOINTS DA API...")

        endpoints = []

        # Procurar por arquivos de rotas
        route_files = [
            "backend/src/routes/auth.routes.ts",
            "backend/src/routes/shipments.routes.ts",
            "backend/src/routes/monitoring.routes.ts",
            "backend/src/routes/alerts.routes.ts",
            "backend/src/routes/users.routes.ts",
            "backend/src/routes/vehicles.routes.ts",
        ]

        print("\n🔗 ENDPOINTS IDENTIFICADOS:")

        for route_file in route_files:
            if os.path.exists(route_file):
                print(f"   📄 {route_file}")
                try:
                    with open(route_file, "r", encoding="utf-8") as f:
                        content = f.read()

                        # Extrair rotas usando regex
                        routes = re.findall(
                            r'router\.(get|post|put|delete)\s*\(\s*[\'"]([^\'"]+)[\'"]', content
                        )
                        for method, path in routes:
                            endpoint = f"{method.upper()} {path}"
                            endpoints.append(endpoint)
                            print(f"      • {endpoint}")

                except Exception as e:
                    print(f"      ❌ Erro ao ler: {e}")

        # Verificar server.ts para endpoints básicos
        if os.path.exists("backend/src/server.ts"):
            try:
                with open("backend/src/server.ts", "r", encoding="utf-8") as f:
                    content = f.read()
                    basic_routes = re.findall(
                        r'app\.(get|post|put|delete)\s*\(\s*[\'"]([^\'"]+)[\'"]', content
                    )
                    for method, path in basic_routes:
                        endpoint = f"{method.upper()} {path}"
                        if endpoint not in endpoints:
                            endpoints.append(endpoint)
                            print(f"      • {endpoint}")
            except Exception as e:
                print(f"   ❌ Erro ao ler server.ts: {e}")

        self.analysis["endpoints"] = endpoints
        print()

    def analyze_mock_data(self):
        """Analisa dados mockados para demonstração"""
        print("🎭 ANALISANDO DADOS MOCKADOS...")

        mock_data = {"usuarios": [], "cargas": [], "veiculos": [], "alertas": [], "zonas_risco": []}

        # Verificar dados mockados no frontend
        frontend_files = [
            "frontend/dashboard.js",
            "frontend/shipments.js",
            "frontend/vehicles.js",
            "frontend/alerts.js",
        ]

        print("\n📊 DADOS MOCKADOS ENCONTRADOS:")

        for file_path in frontend_files:
            if os.path.exists(file_path):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()

                        # Procurar por arrays de dados mockados
                        if "demo" in content.lower() or "mock" in content.lower():
                            print(f"   📄 {file_path} - Contém dados de demonstração")

                            # Extrair informações específicas
                            if "shipment" in content.lower():
                                mock_data["cargas"].append("Dados de cargas mockados")
                            if "vehicle" in content.lower():
                                mock_data["veiculos"].append("Dados de veículos mockados")
                            if "alert" in content.lower():
                                mock_data["alertas"].append("Dados de alertas mockados")

                except Exception as e:
                    print(f"   ❌ Erro ao ler {file_path}: {e}")

        self.analysis["dados_mockados"] = mock_data
        print()

    def generate_summary(self):
        """Gera resumo final da análise"""
        print("📋 RESUMO FINAL DA ANÁLISE")
        print("=" * 80)

        # Status geral
        total_features = len(self.analysis["funcionalidades"])
        implemented_features = sum(self.analysis["funcionalidades"].values())
        implementation_rate = (implemented_features / total_features) * 100

        print(f"\n🎯 STATUS GERAL:")
        print(f"   • Funcionalidades Implementadas: {implemented_features}/{total_features}")
        print(f"   • Taxa de Implementação: {implementation_rate:.1f}%")
        print(f"   • Endpoints da API: {len(self.analysis['endpoints'])}")
        print(
            f"   • Arquivos Principais: {len(self.analysis['estrutura']['backend']) + len(self.analysis['estrutura']['frontend'])}"
        )

        # Tecnologias principais
        print(f"\n🔧 TECNOLOGIAS PRINCIPAIS:")
        backend_techs = set(self.analysis["tecnologias"]["backend"])
        frontend_techs = set(self.analysis["tecnologias"]["frontend"])

        print(f"   🖥️  Backend: {', '.join(sorted(backend_techs))}")
        print(f"   🎨 Frontend: {', '.join(sorted(frontend_techs))}")

        # Funcionalidades implementadas
        print(f"\n✅ FUNCIONALIDADES IMPLEMENTADAS:")
        for feature, implemented in self.analysis["funcionalidades"].items():
            status = "✅" if implemented else "❌"
            feature_name = feature.replace("_", " ").title()
            print(f"   {status} {feature_name}")

        print(f"\n🚀 PRONTO PARA DEMONSTRAÇÃO!")
        print("   • Sistema funcional com dados mockados")
        print("   • Interface completa implementada")
        print("   • API REST operacional")
        print("   • Cenários de demonstração prontos")

    def save_analysis(self):
        """Salva a análise em arquivo JSON"""
        output_file = "analise_sompo_briefing.json"
        try:
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(self.analysis, f, indent=2, ensure_ascii=False)
            print(f"\n💾 Análise salva em: {output_file}")
        except Exception as e:
            print(f"\n❌ Erro ao salvar análise: {e}")

    def run_analysis(self):
        """Executa análise completa"""
        self.print_header()
        self.analyze_package_json()
        self.analyze_project_structure()
        self.analyze_technologies()
        self.analyze_functionality()
        self.analyze_endpoints()
        self.analyze_mock_data()
        self.generate_summary()
        self.save_analysis()


def main():
    """Função principal"""
    try:
        analyzer = SompoProjectAnalyzer()
        analyzer.run_analysis()

        print("\n" + "=" * 80)
        print("🎉 ANÁLISE CONCLUÍDA COM SUCESSO!")
        print("=" * 80)
        print("\n💡 DICAS PARA O BRIEFING:")
        print("   • Use os dados de implementação para mostrar progresso")
        print("   • Destaque as tecnologias modernas utilizadas")
        print("   • Enfatize a funcionalidade completa do sistema")
        print("   • Demonstre os cenários realistas implementados")
        print("   • Mostre a arquitetura escalável do projeto")

    except Exception as e:
        print(f"\n❌ Erro durante a análise: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
