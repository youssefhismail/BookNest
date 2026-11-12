import { Injectable, computed, signal } from '@angular/core';

export type Role = 'student' | 'accountant' | 'admin';
export interface User { username: string; name: string; email: string; role: Role; picture?: string; preference?: string; }
export interface Account extends User { password: string; cardLastFour: string; mockCardNumber: string; }
export interface Product { id: number; title: string; author: string; price: number; kind: 'Book' | 'E-book' | 'Stationery'; color: string; mark: string; stock: number; }
export interface Order { id: string; date: string; productIds: number[]; total: number; }
export interface Fee { ref: string; title: string; date: string; due: string; amount: number; status: string; studentUsername?: string; }
export interface Staff { name: string; role: string; initials: string; base: number; allowance: number; deduction: number; dept: string; }
export interface Department { name: string; income: number; expense: number; color: string; icon: string; }

@Injectable({ providedIn: 'root' })
export class BooknestService {
  readonly products: Product[] = [
    { id: 1, title: 'The Art of Noticing', author: 'Rob Walker', price: 420, kind: 'Book', color: 'peach', mark: '✳', stock: 18 },
    { id: 2, title: 'Small Things Like These', author: 'Claire Keegan', price: 360, kind: 'Book', color: 'sage', mark: '❋', stock: 11 },
    { id: 3, title: 'Bird by Bird', author: 'Anne Lamott', price: 390, kind: 'E-book', color: 'lavender', mark: '✧', stock: 999 },
    { id: 4, title: 'The Creative Act', author: 'Rick Rubin', price: 520, kind: 'Book', color: 'butter', mark: '◌', stock: 7 },
    { id: 5, title: 'Morning Pages Journal', author: 'BookNest Studio', price: 240, kind: 'Stationery', color: 'blue', mark: '▤', stock: 24 },
    { id: 6, title: 'On Writing Well', author: 'William Zinsser', price: 410, kind: 'Book', color: 'rose', mark: '✦', stock: 5 },
  ];
  readonly addedProducts = signal<Product[]>(this.readAddedProducts());
  readonly removedProductIds = signal<number[]>(this.readRemovedProductIds());
  readonly catalog = computed(() => [
    ...this.products.filter(product => !this.removedProductIds().includes(product.id)),
    ...this.addedProducts(),
  ]);

  readonly workshops = [
    { title: 'Writing with Confidence', tag: 'WRITING', description: 'Find your voice, build a writing habit, and make peace with the first draft.', date: 'Nov 18 · Tuesdays', schedule: '5:30 PM · 6 weeks', fee: 2400, seats: 6, art: '✍', color: 'peach' },
    { title: 'The Reading Room', tag: 'READING', description: 'Slow down, read together, and notice what a good story leaves behind.', date: 'Nov 20 · Thursdays', schedule: '6:00 PM · 4 weeks', fee: 1800, seats: 4, art: '▤', color: 'sage' },
    { title: 'Creative Journaling', tag: 'CREATIVITY', description: 'Collect little observations and turn them into a practice of your own.', date: 'Nov 22 · Saturdays', schedule: '11:00 AM · 3 weeks', fee: 1200, seats: 8, art: '✳', color: 'lavender' },
  ];

  readonly fees = [
    { ref: 'BN-2026-041', title: 'Writing with Confidence', date: 'Oct 01, 2026', due: 'Nov 15, 2026', amount: 2400, status: 'Due soon', studentUsername: 'reader' },
    { ref: 'BN-2026-027', title: 'The Reading Room · Term 1', date: 'Sep 01, 2026', due: 'Sep 15, 2026', amount: 1800, status: 'Paid', studentUsername: 'reader' },
    { ref: 'BN-2026-012', title: 'Creative Journaling', date: 'Aug 01, 2026', due: 'Aug 15, 2026', amount: 1200, status: 'Paid', studentUsername: 'reader' },
  ];

  private readonly defaultDepartments: Department[] = [
    { name: 'Bookshop', income: 86500, expense: 48300, color: '#d57952', icon: '▤' },
    { name: 'Workshops', income: 124000, expense: 77200, color: '#6b8064', icon: '✳' },
  ];

  private readonly defaultStaff: Staff[] = [
    { name: 'Nour Hassan', role: 'Writing tutor', initials: 'NH', base: 14800, allowance: 1200, deduction: 0, dept: 'Workshops' },
    { name: 'Mariam Adel', role: 'Shop assistant', initials: 'MA', base: 9200, allowance: 400, deduction: 250, dept: 'Bookshop' },
    { name: 'Omar Farid', role: 'Reading tutor', initials: 'OF', base: 13200, allowance: 900, deduction: 0, dept: 'Workshops' },
    { name: 'Salma Youssef', role: 'Shop assistant', initials: 'SY', base: 8800, allowance: 400, deduction: 0, dept: 'Bookshop' },
  ];

  readonly currentUser = signal<User | null>(this.readSession());
  readonly accounts = signal<Account[]>(this.readAccounts());
  readonly departments = signal<Department[]>(this.readDepartments());
  readonly staff = signal<Staff[]>(this.readStaff());
  readonly extraFees = signal<Fee[]>(this.readExtraFees());
  readonly paidFeeRefs = signal<string[]>(this.readStrings('booknest-paid-fees'));
  readonly wishlist = signal<number[]>(this.readList(this.userStorageKey('wishlist'), 'localStorage'));
  readonly cart = signal<number[]>(this.readList(this.userStorageKey('cart'), 'sessionStorage'));
  readonly enrollments = signal<string[]>(this.readStrings(this.userStorageKey('enrollments')));
  readonly stockLevels = signal<Record<number, number>>(this.readStock());
  readonly orders = signal<Order[]>(this.readOrders(this.userStorageKey('orders')));
  readonly cartCount = computed(() => this.cart().length);
  readonly pageName = signal('Overview');
  readonly helperOpen = signal(false);
  readonly totalIncome = computed(() => this.departments().reduce((sum, item) => sum + item.income, 0));
  readonly totalExpense = computed(() => this.departments().reduce((sum, item) => sum + item.expense, 0));
  readonly monthlyPayroll = computed(() => this.staff().reduce((sum, item) => sum + item.base + item.allowance - item.deduction, 0));

  constructor() { this.setThemeCookie(); }

  signIn(user: User) {
    this.currentUser.set(user);
    if (this.browser()) sessionStorage.setItem('booknest-session', JSON.stringify(user));
    this.loadUserData();
  }
  registerStudent(input: Account): { ok: boolean; message?: string } {
    const username = input.username.trim().toLowerCase();
    if (this.accounts().some(account => account.username.toLowerCase() === username || account.email.toLowerCase() === input.email.toLowerCase())) {
      return { ok: false, message: 'That username or email is already registered. Try signing in instead.' };
    }
    const account = { ...input, username, role: 'student' as const };
    const next = [...this.accounts(), account]; this.accounts.set(next);
    if (this.browser()) localStorage.setItem('booknest-accounts', JSON.stringify(next));
    const { password: _password, cardLastFour: _cardLastFour, ...user } = account;
    if (this.browser()) localStorage.setItem('booknest-profile', JSON.stringify(user));
    this.signIn(user);
    return { ok: true };
  }
  authenticate(username: string, password: string): User | null {
    const normalized = username.trim().toLowerCase();
    if (normalized === 'reader' && password === 'booknest-demo') {
      const user: User = { username: 'reader', name: 'Maya Reader', email: 'reader@booknest.example', role: 'student', preference: 'Fiction & stories' };
      this.signIn(user); return user;
    }
    const account = this.accounts().find(item => item.username.toLowerCase() === normalized && item.password === password);
    if (account) {
      const { password: _password, cardLastFour: _cardLastFour, ...user } = account;
      this.signIn(user); return user;
    }
    if (password === 'booknest-demo' && (normalized === 'admin' || normalized === 'accountant')) {
      const user: User = { username: normalized, name: normalized === 'admin' ? 'BookNest Admin' : 'BookNest Accountant', email: `${normalized}@booknest.example`, role: normalized };
      this.signIn(user); return user;
    }
    return null;
  }
  signOut() {
    if (this.browser()) sessionStorage.removeItem('booknest-session');
    this.currentUser.set(null);
    this.loadUserData();
  }
  addToCart(id: number) {
    const product = this.catalog().find(item => item.id === id);
    if (!product || (product.kind !== 'E-book' && this.cart().filter(item => item === id).length >= this.stockFor(product))) return;
    this.cart.update(items => [...items, id]);
    if (this.browser()) sessionStorage.setItem(this.userStorageKey('cart'), JSON.stringify(this.cart()));
  }
  toggleWishlist(id: number) {
    this.wishlist.update(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]);
    if (this.browser()) localStorage.setItem(this.userStorageKey('wishlist'), JSON.stringify(this.wishlist()));
  }
  enrollCourse(title: string) {
    if (this.enrollments().includes(title)) return false;
    const next = [...this.enrollments(), title]; this.enrollments.set(next);
    if (this.browser()) localStorage.setItem(this.userStorageKey('enrollments'), JSON.stringify(next));
    return true;
  }
  unenrollCourse(title: string) {
    if (!this.enrollments().includes(title)) return false;
    const next = this.enrollments().filter(enrollment => enrollment !== title);
    this.enrollments.set(next);
    if (this.browser()) localStorage.setItem(this.userStorageKey('enrollments'), JSON.stringify(next));
    return true;
  }
  createFee(input: Pick<Fee, 'title' | 'amount' | 'due'> & { studentUsername?: string }) {
    const row: Fee = { ref: `BN-INV-${String(Date.now()).slice(-6)}`, title: input.title.trim(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), due: input.due, amount: input.amount, status: 'Due soon', studentUsername: input.studentUsername || '*' };
    const next = [row, ...this.extraFees()]; this.extraFees.set(next);
    if (this.browser()) localStorage.setItem('booknest-fees', JSON.stringify(next));
    return row;
  }
  markFeePaid(ref: string) {
    if (!this.paidFeeRefs().includes(ref)) {
      const paid = [...this.paidFeeRefs(), ref]; this.paidFeeRefs.set(paid);
      if (this.browser()) localStorage.setItem('booknest-paid-fees', JSON.stringify(paid));
    }
    const next = this.extraFees().map(fee => fee.ref === ref ? { ...fee, status: 'Paid' } : fee);
    this.extraFees.set(next); if (this.browser()) localStorage.setItem('booknest-fees', JSON.stringify(next));
  }
  updateStaff(name: string, field: 'base' | 'allowance' | 'deduction', value: number) {
    const next = this.staff().map(person => person.name === name ? { ...person, [field]: Math.max(0, Number.isFinite(value) ? value : 0) } : person);
    this.staff.set(next); if (this.browser()) localStorage.setItem('booknest-staff', JSON.stringify(next));
  }
  updateDepartment(name: string, field: 'income' | 'expense', value: number) {
    const next = this.departments().map(department => department.name === name ? { ...department, [field]: Math.max(0, Number.isFinite(value) ? value : 0) } : department);
    this.departments.set(next); if (this.browser()) localStorage.setItem('booknest-departments', JSON.stringify(next));
  }
  stockFor(product: Product) { return this.stockLevels()[product.id] ?? product.stock; }
  adjustStock(product: Product, amount: number) {
    const next = { ...this.stockLevels(), [product.id]: Math.max(0, this.stockFor(product) + amount) };
    this.stockLevels.set(next); if (this.browser()) localStorage.setItem('booknest-stock', JSON.stringify(next));
  }
  createProduct(input: Pick<Product, 'title' | 'author' | 'price' | 'kind' | 'stock'>) {
    const colors = ['peach', 'sage', 'lavender', 'butter', 'blue', 'rose'];
    const id = Math.max(...this.products.map(product => product.id), ...this.addedProducts().map(product => product.id), 0) + 1;
    const product: Product = { ...input, id, mark: input.kind === 'Stationery' ? '▤' : '✧', color: colors[(id - 1) % colors.length] };
    const next = [...this.addedProducts(), product]; this.addedProducts.set(next);
    if (this.browser()) localStorage.setItem('booknest-added-products', JSON.stringify(next));
    return product;
  }
  removeProduct(id: number) {
    if (!this.catalog().some(product => product.id === id)) return false;
    if (this.products.some(product => product.id === id)) {
      const removed = [...new Set([...this.removedProductIds(), id])];
      this.removedProductIds.set(removed);
      if (this.browser()) localStorage.setItem('booknest-removed-products', JSON.stringify(removed));
    }
    const added = this.addedProducts().filter(product => product.id !== id);
    this.addedProducts.set(added);
    if (this.browser()) localStorage.setItem('booknest-added-products', JSON.stringify(added));
    const stock = { ...this.stockLevels() };
    delete stock[id];
    this.stockLevels.set(stock);
    if (this.browser()) localStorage.setItem('booknest-stock', JSON.stringify(stock));
    const cart = this.cart().filter(productId => productId !== id);
    this.cart.set(cart);
    if (this.browser()) {
      const cartKey = this.userStorageKey('cart');
      if (cart.length) sessionStorage.setItem(cartKey, JSON.stringify(cart));
      else sessionStorage.removeItem(cartKey);
    }
    const wishlist = this.wishlist().filter(productId => productId !== id);
    this.wishlist.set(wishlist);
    if (this.browser()) localStorage.setItem(this.userStorageKey('wishlist'), JSON.stringify(wishlist));
    return true;
  }
  checkoutCart() {
    const productIds = [...this.cart()];
    if (!productIds.length) return null;
    const total = productIds.reduce((sum, id) => sum + (this.catalog().find(product => product.id === id)?.price ?? 0), 0);
    const order: Order = { id: `BN-${Date.now().toString().slice(-6)}`, date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), productIds, total };
    const history = [order, ...this.orders()]; this.orders.set(history);
    for (const id of productIds) {
      const product = this.catalog().find(item => item.id === id);
      if (product && product.kind !== 'E-book') this.adjustStock(product, -1);
    }
    this.cart.set([]);
    if (this.browser()) { localStorage.setItem(this.userStorageKey('orders'), JSON.stringify(history)); sessionStorage.removeItem(this.userStorageKey('cart')); }
    return order;
  }
  isWishlisted(id: number) { return this.wishlist().includes(id); }
  avatarInitials() {
    const name = this.currentUser()?.name || 'Guest reader';
    return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  }
  pageTitle(title: string) { this.pageName.set(title); }
  userStorageKey(name: string) { return `booknest:${this.currentUser()?.username || 'guest'}:${name}`; }
  format(amount: number) { return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(amount); }

  private browser() { return typeof window !== 'undefined'; }
  private readSession(): User | null {
    if (!this.browser()) return null;
    try { return JSON.parse(sessionStorage.getItem('booknest-session') || 'null') as User | null; } catch { return null; }
  }
  private readAccounts(): Account[] {
    if (!this.browser()) return [];
    try { return JSON.parse(localStorage.getItem('booknest-accounts') || '[]') as Account[]; } catch { return []; }
  }
  private readDepartments(): Department[] {
    if (!this.browser()) return this.defaultDepartments;
    try { const saved = localStorage.getItem('booknest-departments'); return saved ? JSON.parse(saved) as Department[] : this.defaultDepartments; } catch { return this.defaultDepartments; }
  }
  private readStaff(): Staff[] {
    if (!this.browser()) return this.defaultStaff;
    try { const saved = localStorage.getItem('booknest-staff'); return saved ? JSON.parse(saved) as Staff[] : this.defaultStaff; } catch { return this.defaultStaff; }
  }
  private readExtraFees(): Fee[] {
    if (!this.browser()) return [];
    try { return JSON.parse(localStorage.getItem('booknest-fees') || '[]') as Fee[]; } catch { return []; }
  }
  private readList(key: string, storage: 'localStorage' | 'sessionStorage'): number[] {
    if (!this.browser()) return [];
    try { return JSON.parse(window[storage].getItem(key) || '[]') as number[]; } catch { return []; }
  }
  private readOrders(key: string): Order[] {
    if (!this.browser()) return [];
    try { return JSON.parse(localStorage.getItem(key) || '[]') as Order[]; } catch { return []; }
  }
  private readStrings(key: string): string[] {
    if (!this.browser()) return [];
    try { return JSON.parse(localStorage.getItem(key) || '[]') as string[]; } catch { return []; }
  }
  private readStock(): Record<number, number> {
    if (!this.browser()) return {};
    try { return JSON.parse(localStorage.getItem('booknest-stock') || '{}') as Record<number, number>; } catch { return {}; }
  }
  private readAddedProducts(): Product[] {
    if (!this.browser()) return [];
    try { return JSON.parse(localStorage.getItem('booknest-added-products') || '[]') as Product[]; } catch { return []; }
  }
  private readRemovedProductIds(): number[] {
    if (!this.browser()) return [];
    try { return JSON.parse(localStorage.getItem('booknest-removed-products') || '[]') as number[]; } catch { return []; }
  }
  private loadUserData() {
    this.wishlist.set(this.readList(this.userStorageKey('wishlist'), 'localStorage'));
    this.cart.set(this.readList(this.userStorageKey('cart'), 'sessionStorage'));
    this.enrollments.set(this.readStrings(this.userStorageKey('enrollments')));
    this.orders.set(this.readOrders(this.userStorageKey('orders')));
  }
  private setThemeCookie() {
    if (!this.browser()) return;
    if (!document.cookie.split('; ').some(cookie => cookie.startsWith('booknest-seen='))) {
      document.cookie = 'booknest-seen=1; Path=/; SameSite=Lax; Max-Age=2592000';
    }
  }
}
