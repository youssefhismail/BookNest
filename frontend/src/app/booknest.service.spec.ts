import { TestBed } from '@angular/core/testing';
import { BooknestService } from './booknest.service';

describe('BooknestService', () => {
  let store: BooknestService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = 'booknest-seen=; Path=/; Max-Age=0';
    TestBed.configureTestingModule({ providers: [BooknestService] });
    store = TestBed.inject(BooknestService);
  });

  it('sums department income and expenses for the finance dashboard', () => {
    expect(store.totalIncome()).toBe(210500);
    expect(store.totalExpense()).toBe(125500);
    expect(store.totalIncome() - store.totalExpense()).toBe(85000);
  });

  it('keeps wishlist data in local storage', () => {
    store.toggleWishlist(1);
    expect(store.wishlist()).toEqual([1]);
    expect(JSON.parse(localStorage.getItem(store.userStorageKey('wishlist')) || '[]')).toEqual([1]);
    store.toggleWishlist(1);
    expect(store.wishlist()).toEqual([]);
  });

  it('keeps the cart in the current session and creates an order on checkout', () => {
    const item = store.products.find(product => product.id === 1)!;
    const stockBefore = store.stockFor(item);
    store.addToCart(item.id);

    expect(store.cartCount()).toBe(1);
    expect(sessionStorage.getItem(store.userStorageKey('cart'))).toBe('[1]');
    const order = store.checkoutCart();

    expect(order?.total).toBe(item.price);
    expect(store.orders()[0].productIds).toEqual([item.id]);
    expect(store.stockFor(item)).toBe(stockBefore - 1);
    expect(sessionStorage.getItem(store.userStorageKey('cart'))).toBeNull();
  });

  it('stores workshop enrollment locally and prevents duplicate enrollment', () => {
    const title = store.workshops[0].title;
    expect(store.enrollCourse(title)).toBeTrue();
    expect(store.enrollCourse(title)).toBeFalse();
    expect(store.enrollments()).toEqual([title]);
    expect(JSON.parse(localStorage.getItem(store.userStorageKey('enrollments')) || '[]')).toEqual([title]);
  });

  it('adds admin products to the persistent catalog', () => {
    const product = store.createProduct({ title: 'New Book', author: 'Demo Author', price: 300, kind: 'Book', stock: 4 });
    expect(store.catalog().some(item => item.id === product.id)).toBeTrue();
    expect(store.stockFor(product)).toBe(4);
    expect(JSON.parse(localStorage.getItem('booknest-added-products') || '[]')[0].title).toBe('New Book');
  });

  it('registers and authenticates a student account with demo credentials', () => {
    const result = store.registerStudent({ username: 'reader.one', name: 'Reader One', email: 'reader.one@example.test', role: 'student', password: 'course-demo-123', picture: 'data:image/png;base64,AA==', preference: 'Fiction & stories', cardLastFour: '0000', mockCardNumber: '0000000000000000' });
    expect(result.ok).toBeTrue();
    store.signOut();
    const user = store.authenticate('reader.one', 'course-demo-123');
    expect(user?.name).toBe('Reader One');
    expect(user?.role).toBe('student');
    expect(store.accounts()[0].mockCardNumber).toBe('0000000000000000');
    expect(store.authenticate('reader.one', 'wrong-password')).toBeNull();
  });

  it('updates payroll and department values and creates a fee invoice', () => {
    store.updateStaff('Nour Hassan', 'allowance', 1500);
    store.updateDepartment('Bookshop', 'income', 90000);
    const invoice = store.createFee({ title: 'Poetry Workshop', amount: 950, due: '2026-11-30', studentUsername: '*' });
    expect(store.staff().find(person => person.name === 'Nour Hassan')?.allowance).toBe(1500);
    expect(store.departments().find(department => department.name === 'Bookshop')?.income).toBe(90000);
    expect(store.extraFees()[0].ref).toBe(invoice.ref);
  });

  it('keeps fee payment status shared across student and staff views', () => {
    const ref = store.fees[0].ref;
    store.markFeePaid(ref);
    expect(store.paidFeeRefs()).toContain(ref);
    expect(JSON.parse(localStorage.getItem('booknest-paid-fees') || '[]')).toContain(ref);
  });
});
