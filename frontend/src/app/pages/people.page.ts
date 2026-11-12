import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BooknestService, User } from '../booknest.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-intro"><div><span class="eyebrow">ADMINISTRATION</span><h1>People & <em>access.</em></h1><p>Review demo student accounts, the payroll team and what each sign-in role can access.</p></div></section>

    <section class="people-section content-card">
      <div class="card-heading"><div><span class="eyebrow">LEARNER ACCOUNTS</span><h2>Students</h2></div><span class="table-count">{{studentAccounts().length}} accounts</span></div>
      <div class="table-scroll"><table><thead><tr><th>STUDENT</th><th>USERNAME</th><th>EMAIL</th><th>READING INTEREST</th><th>ACCESS</th></tr></thead><tbody>
        @for (student of studentAccounts(); track student.username) {
          <tr><td><strong>{{student.name}}</strong></td><td>{{student.username}}</td><td>{{student.email}}</td><td>{{student.preference || 'Not set'}}</td><td><span class="role-chip">Student</span></td></tr>
        }
      </tbody></table></div>
      <div class="table-note"><span>ⓘ</span> Student accounts are saved in this browser. Passwords are never shown here.</div>
    </section>

    <section class="people-section content-card">
      <div class="card-heading"><div><span class="eyebrow">PAYROLL RECORDS</span><h2>Staff team</h2></div><span class="table-count">{{store.staff().length}} employees</span></div>
      <div class="table-scroll"><table><thead><tr><th>TEAM MEMBER</th><th>JOB TITLE</th><th>DEPARTMENT</th><th>PAYROLL</th></tr></thead><tbody>
        @for (member of store.staff(); track member.name) {
          <tr><td><div class="staff-person"><span class="staff-avatar">{{member.initials}}</span><strong>{{member.name}}</strong></div></td><td>{{member.role}}</td><td>{{member.dept}}</td><td><a class="table-action" routerLink="/payroll">View payroll →</a></td></tr>
        }
      </tbody></table></div>
      <div class="table-note"><span>ⓘ</span> These are employee payroll records. Sign-in permissions belong to the Student, Accountant and Admin roles below.</div>
    </section>

    <section class="people-access">
      <div class="card-heading"><div><span class="eyebrow">ROLE PERMISSIONS</span><h2>What each role can do</h2></div></div>
      <div class="people-role-grid">
        <article class="content-card"><span class="role-chip">Student</span><p>Browse and buy from the shop, enroll in workshops, and view personal fees, wishlist, order history and profile.</p></article>
        <article class="content-card"><span class="role-chip">Accountant</span><p>View and update department budget figures, manage payroll and handle student fee invoices and records.</p></article>
        <article class="content-card"><span class="role-chip">Admin</span><p>View department budgets, payroll and people/access records. Manage products and stock; payroll and budget figures are read-only.</p></article>
      </div>
      <div class="table-note"><span>ⓘ</span> Shop and workshop browsing are available without signing in. Restricted management pages require the matching role.</div>
    </section>
  `
})
export class PeoplePage {
  protected readonly store = inject(BooknestService);

  constructor() { this.store.pageTitle('People & access'); }

  studentAccounts(): User[] {
    const registered = this.store.accounts().map(({ password: _password, cardLastFour: _lastFour, mockCardNumber: _mockCard, ...user }) => user);
    if (!registered.some(user => user.username.toLowerCase() === 'reader')) {
      registered.unshift({ username: 'reader', name: 'Maya Reader', email: 'reader@booknest.example', role: 'student', preference: 'Fiction & stories' });
    }
    return registered.filter(user => user.role === 'student');
  }
}
