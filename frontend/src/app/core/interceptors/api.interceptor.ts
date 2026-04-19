import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { EditorSessionService } from '../services/editor-session.service';
import { LoadingService } from '../services/loading.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const editorSession = inject(EditorSessionService);

  loadingService.start();

  const cloned = req.clone({
    setHeaders: {
      'x-editor-id': editorSession.getEditorId(),
    },
  });

  return next(cloned).pipe(finalize(() => loadingService.stop()));
};
