from django.contrib import admin
from django.utils.html import format_html
from .models import Usuario, Enquete, Voto, OpcaoVoto, Enquete_Opcao_Voto

# -------------------
# Inline para mostrar opções de voto dentro da Enquete
# -------------------
class EnqueteOpcaoVotoInline(admin.TabularInline):
    model = Enquete_Opcao_Voto
    extra = 1  # mostra 1 linha extra para adicionar nova opção rapidamente
    autocomplete_fields = ['id_opcao_voto']  # campo pesquisável

# -------------------
# Admin do Usuário
# -------------------
@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ['email', 'tipo_usuario', 'status', 'imagem_preview', 'criado_em', 'actualizado_em']
    search_fields = ['email', 'tipo_usuario']
    list_filter = ['tipo_usuario', 'status']
    readonly_fields = ['criado_em', 'actualizado_em']

    # Função para mostrar a imagem do usuário no admin
    def imagem_preview(self, obj):
        if obj.caminho_imagem:
            return format_html(
                '<img src="{}" style="width:50px; height:50px; border-radius:50%;" />', 
                obj.caminho_imagem.url
            )
        return "-"
    imagem_preview.short_description = 'Imagem'

# -------------------
# Admin da Enquete
# -------------------
@admin.register(Enquete)
class EnqueteAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'usuario', 'data_inicio', 'data_fim', 'status']
    search_fields = ['titulo', 'descricao', 'usuario__email']
    list_filter = ['status', 'data_inicio', 'data_fim']
    date_hierarchy = 'data_inicio'
    inlines = [EnqueteOpcaoVotoInline]  # adiciona as opções diretamente na Enquete

# -------------------
# Admin do Voto
# -------------------
@admin.register(Voto)
class VotoAdmin(admin.ModelAdmin):
    list_display = ['id_usuario', 'id_enquete', 'id_opcao_voto', 'criado_em']
    search_fields = ['id_usuario__email', 'id_enquete__titulo', 'id_opcao_voto__designacao']
    list_filter = ['id_enquete', 'id_opcao_voto']

# -------------------
# Admin do Enquete_Opcao_Voto
# -------------------
@admin.register(Enquete_Opcao_Voto)
class Enquete_Opcao_VotoAdmin(admin.ModelAdmin):
    list_display = ['id_enquete', 'id_opcao_voto']
    search_fields = ['id_enquete__titulo', 'id_opcao_voto__designacao']
    list_filter = ['id_enquete']

# -------------------
# Admin da OpcaoVoto
# -------------------
@admin.register(OpcaoVoto)
class OpcaoVotoAdmin(admin.ModelAdmin):
    list_display = ['designacao', 'descricao', 'criado_em']
    search_fields = ['designacao', 'descricao']
    list_filter = ['criado_em']
