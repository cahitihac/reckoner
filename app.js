const { createApp } = Vue;

const STORAGE_KEY = 'expense-splitter-v1';

createApp({
  data() {
    return {
      eventName: 'Group Event',
      currency: 'zł',
      participants: [],
      expenses: [],

      // Participant input
      newParticipantName: '',
      participantError: '',

      // Inline event-name editing
      editingEventName: false,
      tempEventName: '',

      // Modal
      showModal: false,
      editingExpenseId: null,
      form: {
        description: '',
        amount: '',
        payerId: '',
        participantIds: []
      },
      formError: '',

      // Delete confirmation
      deleteConfirmId: null,

      // Settlement mode: 'minimize' | 'direct'
      settlementMode: 'minimize'
    };
  },

  computed: {
    participantMap() {
      const map = {};
      this.participants.forEach(p => { map[p.id] = p; });
      return map;
    },

    totalSpent() {
      return this.expenses.reduce((sum, e) => sum + e.amount, 0);
    },

    // Per-person: how much they paid out of pocket vs. their consumed share
    spendingStats() {
      const stats = {};
      this.participants.forEach(p => {
        stats[p.id] = { paid: 0, share: 0 };
      });

      this.expenses.forEach(exp => {
        const n = exp.participantIds.length;
        if (n === 0) return;
        const share = exp.amount / n;

        if (stats[exp.payerId] !== undefined) {
          stats[exp.payerId].paid += exp.amount;
        }
        exp.participantIds.forEach(pid => {
          if (stats[pid] !== undefined) {
            stats[pid].share += share;
          }
        });
      });

      Object.keys(stats).forEach(id => {
        stats[id].paid  = Math.round(stats[id].paid  * 100) / 100;
        stats[id].share = Math.round(stats[id].share * 100) / 100;
      });
      return stats;
    },

    balances() {
      const bal = {};
      this.participants.forEach(p => { bal[p.id] = 0; });

      this.expenses.forEach(exp => {
        const n = exp.participantIds.length;
        if (n === 0) return;
        const share = exp.amount / n;

        // Payer gets credited for the full amount they put in
        if (bal[exp.payerId] !== undefined) {
          bal[exp.payerId] += exp.amount;
        }
        // Each participant is debited their share
        exp.participantIds.forEach(pid => {
          if (bal[pid] !== undefined) {
            bal[pid] -= share;
          }
        });
      });

      // Round to 2 decimal places to prevent floating-point display noise
      Object.keys(bal).forEach(id => {
        bal[id] = Math.round(bal[id] * 100) / 100;
      });
      return bal;
    },

    // Greedy minimum-transactions settlement
    minimizeSettlements() {
      const epsilon = 0.005;

      // Build mutable creditor/debtor lists from the (already rounded) balances
      const creditors = [];
      const debtors = [];
      Object.entries(this.balances).forEach(([id, b]) => {
        if (b > epsilon) creditors.push({ id, balance: b });
        else if (b < -epsilon) debtors.push({ id, balance: -b }); // store as positive
      });

      // Sort largest-first for efficient greedy pairing
      creditors.sort((a, b) => b.balance - a.balance);
      debtors.sort((a, b) => b.balance - a.balance);

      const txns = [];
      let ci = 0, di = 0;

      while (ci < creditors.length && di < debtors.length) {
        const c = creditors[ci];
        const d = debtors[di];
        const amount = Math.min(c.balance, d.balance);

        if (amount > epsilon) {
          txns.push({
            fromId: d.id,
            toId: c.id,
            amount: Math.round(amount * 100) / 100
          });
        }

        c.balance = Math.round((c.balance - amount) * 100) / 100;
        d.balance = Math.round((d.balance - amount) * 100) / 100;

        if (c.balance <= epsilon) ci++;
        if (d.balance <= epsilon) di++;
      }

      return txns;
    },

    // Pairwise direct settlement — net debts between each pair of people
    directSettlements() {
      const epsilon = 0.005;

      // Build gross pairwise debt: debt[fromId][toId] = total owed
      const debt = {};
      this.expenses.forEach(exp => {
        const n = exp.participantIds.length;
        if (n === 0) return;
        const share = exp.amount / n;
        exp.participantIds.forEach(pid => {
          if (pid === exp.payerId) return;
          if (!debt[pid]) debt[pid] = {};
          debt[pid][exp.payerId] = (debt[pid][exp.payerId] || 0) + share;
        });
      });

      // Net out each pair and emit one transaction if non-zero
      const txns = [];
      const processed = new Set();
      Object.keys(debt).forEach(fromId => {
        Object.keys(debt[fromId]).forEach(toId => {
          const key = [fromId, toId].sort().join('|');
          if (processed.has(key)) return;
          processed.add(key);

          const ab = (debt[fromId] && debt[fromId][toId]) || 0;
          const ba = (debt[toId]   && debt[toId][fromId]) || 0;
          const net = Math.round((ab - ba) * 100) / 100;

          if (net > epsilon) {
            txns.push({ fromId, toId, amount: net });
          } else if (net < -epsilon) {
            txns.push({ fromId: toId, toId: fromId, amount: Math.round(-net * 100) / 100 });
          }
        });
      });

      return txns;
    },

    settlements() {
      return this.settlementMode === 'direct'
        ? this.directSettlements
        : this.minimizeSettlements;
    },

    hasData() {
      return this.expenses.length > 0;
    },

    allSettled() {
      return this.hasData && this.settlements.length === 0;
    },

    // For the modal: per-person share preview
    sharePreview() {
      const amount = parseFloat(this.form.amount);
      const count = this.form.participantIds.length;
      if (!amount || amount <= 0 || count === 0) return null;
      return Math.round((amount / count) * 100) / 100;
    }
  },

  watch: {
    eventName() { this.persist(); },
    currency() { this.persist(); },
    participants: { deep: true, handler() { this.persist(); } },
    expenses: { deep: true, handler() { this.persist(); } }
  },

  created() {
    this.restore();
  },

  mounted() {
    window.addEventListener('keydown', this.onKeyDown);
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  },

  methods: {
    // ── Persistence ──────────────────────────────────────────────────────────

    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          eventName: this.eventName,
          currency: this.currency,
          participants: this.participants,
          expenses: this.expenses
        }));
      } catch (_) { /* storage unavailable — fail silently */ }
    },

    restore() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const d = JSON.parse(raw);
        if (typeof d.eventName === 'string') this.eventName = d.eventName;
        if (typeof d.currency === 'string') this.currency = d.currency;
        if (Array.isArray(d.participants)) this.participants = d.participants;
        if (Array.isArray(d.expenses)) this.expenses = d.expenses;
      } catch (_) { /* malformed data — start fresh */ }
    },

    // ── Utilities ────────────────────────────────────────────────────────────

    uid() {
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    },

    fmt(amount) {
      const n = parseFloat(amount);
      if (isNaN(n)) return this.currency + '0.00';
      const sign = n < 0 ? '-' : '';
      return sign + this.currency + Math.abs(n).toFixed(2);
    },

    initial(name) {
      return (name || '?').charAt(0).toUpperCase();
    },

    participantName(id) {
      return this.participantMap[id]?.name ?? '(unknown)';
    },

    onKeyDown(e) {
      if (e.key === 'Escape') {
        if (this.showModal) this.closeModal();
        else if (this.deleteConfirmId) this.cancelDelete();
        else if (this.editingEventName) this.editingEventName = false;
      }
    },

    // ── Event Name editing ───────────────────────────────────────────────────

    startEditEventName() {
      this.tempEventName = this.eventName;
      this.editingEventName = true;
      this.$nextTick(() => this.$refs.eventNameInput?.focus());
    },

    saveEventName() {
      const name = this.tempEventName.trim();
      if (name) this.eventName = name;
      this.editingEventName = false;
    },

    // ── Participants ─────────────────────────────────────────────────────────

    addParticipant() {
      const name = this.newParticipantName.trim();
      if (!name) {
        this.participantError = 'Please enter a name.';
        return;
      }
      if (this.participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        this.participantError = `"${name}" is already in the list.`;
        return;
      }
      this.participants.push({ id: this.uid(), name });
      this.newParticipantName = '';
      this.participantError = '';
    },

    canDeleteParticipant(id) {
      return !this.expenses.some(e => e.payerId === id || e.participantIds.includes(id));
    },

    removeParticipant(id) {
      if (!this.canDeleteParticipant(id)) return;
      this.participants = this.participants.filter(p => p.id !== id);
    },

    // ── Expenses / Modal ─────────────────────────────────────────────────────

    openAddModal() {
      this.editingExpenseId = null;
      this.form = {
        description: '',
        amount: '',
        payerId: this.participants.length === 1 ? this.participants[0].id : '',
        participantIds: this.participants.map(p => p.id) // default: all selected
      };
      this.formError = '';
      this.showModal = true;
      this.$nextTick(() => this.$refs.descInput?.focus());
    },

    openEditModal(expense) {
      this.editingExpenseId = expense.id;
      this.form = {
        description: expense.description,
        amount: String(expense.amount),
        payerId: expense.payerId,
        participantIds: [...expense.participantIds]
      };
      this.formError = '';
      this.showModal = true;
      this.$nextTick(() => this.$refs.descInput?.focus());
    },

    closeModal() {
      this.showModal = false;
    },

    selectAllParticipants() {
      this.form.participantIds = this.participants.map(p => p.id);
    },

    clearAllParticipants() {
      this.form.participantIds = [];
    },

    saveExpense() {
      const desc = this.form.description.trim();
      const amount = parseFloat(this.form.amount);

      if (!desc) {
        this.formError = 'Please enter a description.';
        return;
      }
      if (isNaN(amount) || amount <= 0) {
        this.formError = 'Enter a valid amount greater than 0.';
        return;
      }
      if (!this.form.payerId) {
        this.formError = 'Please select who paid.';
        return;
      }
      if (this.form.participantIds.length === 0) {
        this.formError = 'Select at least one participant to split this expense with.';
        return;
      }

      const expense = {
        id: this.editingExpenseId ?? this.uid(),
        description: desc,
        amount,
        payerId: this.form.payerId,
        participantIds: [...this.form.participantIds]
      };

      if (this.editingExpenseId) {
        const idx = this.expenses.findIndex(e => e.id === this.editingExpenseId);
        if (idx !== -1) this.expenses.splice(idx, 1, expense);
      } else {
        this.expenses.push(expense);
      }

      this.showModal = false;
    },

    confirmDelete(id) {
      this.deleteConfirmId = id;
    },

    cancelDelete() {
      this.deleteConfirmId = null;
    },

    deleteExpense(id) {
      this.expenses = this.expenses.filter(e => e.id !== id);
      this.deleteConfirmId = null;
    },

    clearAll() {
      if (confirm('Reset everything and start over? All data will be permanently lost.')) {
        this.participants = [];
        this.expenses = [];
        this.eventName = 'Group Event';
        this.currency = 'zł';
        this.deleteConfirmId = null;
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      }
    }
  }
}).mount('#app');
