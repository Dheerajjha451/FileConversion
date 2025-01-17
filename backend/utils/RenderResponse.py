from flask import Flask,render_template
def RenderResponse(template_name, status_code, context=None):
   
    context = context if context is not None else {}
    return render_template(template_name, **context), status_code