from django.views.generic.edit import CreateView, DeleteView,UpdateView
from django.views.generic.list import ListView
from django.views.generic import TemplateView
# Create your views here.
class IndexView(TemplateView):
    template_name='pages/index.html'
