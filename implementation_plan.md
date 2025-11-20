# Frontend Refactoring and Improvement Plan

## Goal Description

Refactor and improve the veterinary frontend application to address architectural, security, optimization, data modeling, and UX issues. This includes introducing environment variables, handling session expiration, preventing memory leaks, mapping report data, and adding visual feedback for API calls.

## User Review Required

> [!IMPORTANT]
> Please review the proposed changes for the `ErrorInterceptor` to ensure the auto-logout behavior meets requirements.

## Proposed Changes

### Architecture (Environment & API)

#### [NEW] [environment.ts](file:///c:/Users/user/Documents/veterinaria-frontend/src/environments/environment.ts)

- Define `environment` object with `production: false` and `apiUrl`.

#### [NEW] [environment.prod.ts](file:///c:/Users/user/Documents/veterinaria-frontend/src/environments/environment.prod.ts)

- Define `environment` object with `production: true` and `apiUrl`.

#### [MODIFY] [api.service.ts](file:///c:/Users/user/Documents/veterinaria-frontend/src/app/core/services/api.service.ts)

- Import `environment`.
- Replace hardcoded URL with `environment.apiUrl`.

### Security (Auto Logout)

#### [MODIFY] [error.interceptor.ts](file:///c:/Users/user/Documents/veterinaria-frontend/src/app/core/interceptors/error.interceptor.ts)

- Inject `Router`.
- In `catchError`, check for 401 status.
- Clear `localStorage` and navigate to `/login`.

### Optimization (Memory Management)

#### [MODIFY] [atencion-cola.component.ts](file:///c:/Users/user/Documents/veterinaria-frontend/src/app/features/atenciones/components/atencion-cola/atencion-cola.component.ts) (and others with polling)

- Implement `DestroySubject` pattern.
- Use `takeUntil(this.destroy$)` in subscriptions.

### Data Modeling (Reports)

#### [MODIFY] [api.service.ts](file:///c:/Users/user/Documents/veterinaria-frontend/src/app/core/services/api.service.ts) or Report Components

- Add mapper functions to transform `List<Object[]>` to structured objects.

### UX (Visual Feedback)

#### [MODIFY] Main Components (e.g., Lists, Forms)

- Add `isLoading` signal/variable.
- Set `isLoading` before API calls and reset in `finalize`.
- Update templates to show spinners/disable buttons.

## Verification Plan

### Automated Tests

- Run existing tests to ensure no regressions.
- `ng test`

### Manual Verification

- **Environment**: Verify API calls work in dev mode.
- **Security**: Manually expire token (or wait) and verify redirect to login on 401.
- **Optimization**: Check for memory leaks using browser dev tools (optional, but good practice). Verify components destroy correctly.
- **Reports**: Verify report data is displayed correctly.
- **UX**: Verify loading spinners appear during API calls.
