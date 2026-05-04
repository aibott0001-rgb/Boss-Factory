// ... imports

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
     // ... your client config
  );
  
  const {  { session } } = await supabase.auth.getSession();
  const { pathname } = req.nextUrl;

  // 1. Define Protected Routes
  const protectedRoutes = ['/dashboard', '/vault', '/neural', '/admin', '/keymaster', '/settings'];
  
  // 2. If accessing protected route without session -> Redirect to Login
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. If logged in and trying to see login/signup -> Redirect to Dashboard
  if ((pathname === '/login' || pathname === '/signup') && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}
