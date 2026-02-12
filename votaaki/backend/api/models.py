from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
# Create your models here.
CHOICES_STATUS=[
    ("activa","ACTIVA"),
   ( "encerrada","ENCERRADA")
 ]
class Base(models.Model):
    criado_em = models.DateTimeField(auto_now_add=True)
    actualizado_em = models.DateTimeField(auto_now=True)
    class Meta:
        abstract=True    
class Usuario(Base,AbstractUser):

    username = None  # remove o username padrão
    email = models.EmailField(unique=True)

    STATUS_CHOICES = [
        ('ativo', 'Ativo'),
        ('inativo', 'Inativo'),
        ('banido', 'Banido'),
    ]

    TIPO_CHOICES = [
        ('admin', 'Admin'),
        ('usuario', 'Usuario'),
    ]

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='ativo'
    )

    tipo_usuario = models.CharField(
        max_length=10,
        choices=TIPO_CHOICES,
        default='usuario'
    )

    caminho_imagem = models.ImageField(
        upload_to='images/users/',
        null=True,
        blank=True
    )

   
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    # Resolver conflito de reverse accessor com o auth.User
    groups = models.ManyToManyField(
        'auth.Group',  # Relacionamento Many-to-Many com o modelo Group do Django
        related_name='custom_user_set',  # Nome do reverse accessor para evitar conflito com user_set padrão
        blank=True,  # Permite que o campo seja opcional no formulário/admin
        help_text=('The groups this user belongs to.'),  # Texto de ajuda no admin
        verbose_name=('groups'),  # Nome amigável do campo no admin
    )

    user_permissions = models.ManyToManyField(
        'auth.Permission',  # Relacionamento Many-to-Many com o modelo Permission do Django
        related_name='custom_user_set_permissions',  # Nome do reverse accessor para evitar conflito
        blank=True,  # Permite que o campo seja opcional
        help_text=('Specific permissions for this user.'),  # Texto de ajuda no admin
        verbose_name=('user permissions'),  # Nome amigável do campo no admin
    )

    def __str__(self):
        return self.email
    class Meta:
        verbose_name="Usuario"
        verbose_name_plural="Usuarios"


class Enquete(Base):
    id_enquete = models.UUIDField(default=uuid.uuid4, blank=False, null=False, verbose_name="Código")
    titulo =models.CharField(max_length=300, verbose_name="Enquete", null=False,blank=False)
    descricao=models.TextField(verbose_name="Descrição")
    data_inicio =models.DateTimeField(verbose_name="Data de Inicio", null=False,blank=False)
    data_fim =models.DateTimeField(verbose_name="Data de Fim", null=False,blank=False)
    status=models.CharField(choices=CHOICES_STATUS, blank=False,null=False)
    usuario=models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="enquetes")
    def __str__(self):
        return self.titulo
    class Meta:
        verbose_name="Enquete"
        verbose_name_plural="Enquetes"
    pass
class OpcaoVoto(Base):
    id_opcao_voto=models.UUIDField(default=uuid.uuid4, editable=False, null=False, blank=False)
    designacao=models.CharField(max_length=255, verbose_name="Opção", null=False, blank=False)
    descricao=models.TextField(verbose_name="Descricao")
    def __str__(self):
        return self.designicao
    class Meta:
        verbose_name="Opção de Voto"
        verbose_name_plural="Opções de Voto"
    pass
class Enquete_Opcao_Voto(Base):
    id_enquete_opcao_voto=models.UUIDField(default=uuid.uuid4)
    id_enquete=models.ForeignKey(
        Enquete,
        on_delete=models.CASCADE
    )
    id_opcao_voto=models.ForeignKey(
        OpcaoVoto,
        on_delete=models.CASCADE
    )
    def __str__(self):
        return f"{self.id_enquete} »»» {self.id_opcao_voto}"

    pass
class Voto(Base):
    id_voto=models.UUIDField(default=uuid.uuid4)
    id_usuario=models.ForeignKey(Usuario, on_delete=models.CASCADE)
    id_enquete=models.ForeignKey(Enquete, on_delete=models.CASCADE)
    id_opcao_voto=models.ForeignKey(OpcaoVoto, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.id_usuario} escolheu {self.id_opcao_voto} no enquete {self.id_enquete}"
    class Meta:
        unique_together = ('id_enquete', 'id_opcao_voto')

    pass
