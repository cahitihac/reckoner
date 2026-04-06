<template>
  <div class="bg-slate-100 min-h-screen">
  <!-- ═══════════════════════════════════════════════════════════════ HEADER -->
  <header class="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

      <!-- Left: Event name -->
      <div class="flex items-center gap-3 min-w-0">
        <img src="/logo.svg" alt="Reckoner" class="w-9 h-9 flex-shrink-0 select-none" />
        <div class="min-w-0">
          <!-- Display mode -->
          <div v-if="!editingEventName" class="flex items-center gap-1.5">
            <h1 class="text-xl font-bold text-slate-800 leading-none truncate">{{ eventName }}</h1>
            <button
              @click="startEditEventName"
              class="text-slate-400 hover:text-indigo-500 transition-colors flex-shrink-0 p-1"
              :title="$t('header.renameEvent')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
            </button>
          </div>
          <!-- Edit mode -->
          <div v-else>
            <input
              ref="eventNameInput"
              v-model="tempEventName"
              @keyup.enter="saveEventName"
              @keyup.escape="editingEventName = false"
              @blur="saveEventName"
              class="border border-indigo-400 rounded-md px-2 py-0.5 text-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-56"
            />
          </div>
          <p class="text-xs text-slate-400 mt-0.5 leading-none">{{ $t('header.reckoner') }}</p>
        </div>
      </div>

      <!-- Right: Currency + Reset -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <label class="flex items-center gap-1.5 text-sm text-slate-500">
          <span class="hidden sm:inline whitespace-nowrap">{{ $t('header.currency') }}</span>
          <input
            v-model="currency"
            maxlength="5"
            class="border border-slate-300 rounded-md px-2 py-1 w-14 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </label>
        <!-- Language picker -->
        <div class="relative">
          <button
            @click="showLangMenu = !showLangMenu"
            class="flex items-center gap-1 border border-slate-300 rounded-md px-2 py-1 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
            :title="$t('header.language')"
          >
            <span class="text-base leading-none">{{ currentLang.flag }}</span>
            <span class="hidden sm:inline text-xs text-slate-600">{{ currentLang.name }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="hidden sm:block h-3 w-3 text-slate-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
          <div v-if="showLangMenu">
            <div class="fixed inset-0 z-40" @click="showLangMenu = false"></div>
            <div class="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 min-w-max">
              <button
                v-for="lang in languages"
                :key="lang.code"
                @click="locale = lang.code; showLangMenu = false"
                class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                :class="locale === lang.code ? 'font-semibold text-indigo-600' : 'text-slate-700'"
              >
                <span>{{ lang.flag }}</span>
                <span>{{ lang.name }}</span>
              </button>
            </div>
          </div>
        </div>
        <button
          @click="clearAll"
          class="flex items-center gap-1 text-red-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors"
          :title="$t('header.resetAllData')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <span class="hidden sm:inline text-xs font-medium">{{ $t('header.resetAll') }}</span>
        </button>
      </div>

    </div>
  </header>

  <!-- ════════════════════════════════════════════════════════════════ MAIN -->
  <main class="max-w-6xl mx-auto px-4 py-6 pb-24 lg:pb-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

    <!-- ───────────────────────────── Left+Centre: Participants & Expenses -->
    <div class="lg:col-span-2 space-y-6">

      <!-- ════════════════════════════════════════════ PARTICIPANTS SECTION -->
      <section class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {{ participants.length }}
          </span>
          <h2 class="font-semibold text-slate-700">{{ $t('participants.heading') }}</h2>
        </div>

        <div class="p-5">
          <!-- Add participant input -->
          <div class="flex gap-2 mb-3">
            <input
              v-model="newParticipantName"
              @keyup.enter="addParticipant"
              @input="participantError = ''"
              :placeholder="$t('participants.placeholder')"
              class="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            <button
              @click="addParticipant"
              class="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {{ $t('participants.add') }}
            </button>
          </div>
          <p v-if="participantError" class="text-red-500 text-xs mb-3 -mt-1">{{ participantError }}</p>

          <!-- Empty state -->
          <div v-if="participants.length === 0" class="text-center py-5 text-slate-400 text-sm">
            {{ $t('participants.emptyState') }}
          </div>

          <!-- Participant chips -->
          <div v-else class="flex flex-wrap gap-2">
            <div
              v-for="p in participants"
              :key="p.id"
              class="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full pl-1.5 pr-2 py-1"
            >
              <span class="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {{ initial(p.name) }}
              </span>
              <span class="text-sm text-slate-700 font-medium">{{ p.name }}</span>
              <button
                @click="removeParticipant(p.id)"
                :disabled="!canDeleteParticipant(p.id)"
                :title="canDeleteParticipant(p.id) ? $t('participants.removeTitle') : $t('participants.cantRemoveTitle')"
                class="ml-0.5 transition-colors"
                :class="canDeleteParticipant(p.id)
                  ? 'text-slate-400 hover:text-red-500 cursor-pointer'
                  : 'text-slate-200 cursor-not-allowed'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════ EXPENSES SECTION -->
      <section class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {{ expenses.length }}
            </span>
            <h2 class="font-semibold text-slate-700">{{ $t('expenses.heading') }}</h2>
          </div>
          <button
            @click="openAddModal"
            :disabled="participants.length === 0"
            :title="participants.length === 0 ? $t('expenses.addParticipantsFirst') : $t('expenses.addNewExpense')"
            class="hidden sm:flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors flex-shrink-0"
            :class="participants.length > 0
              ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
            {{ $t('expenses.addExpense') }}
          </button>
        </div>

        <div class="p-5">
          <!-- Empty state -->
          <div v-if="expenses.length === 0" class="text-center py-10 text-slate-400">
            <div class="text-4xl mb-2">🧾</div>
            <p class="text-sm">{{ $t('expenses.noExpensesYet') }}</p>
            <p v-if="participants.length === 0" class="text-xs mt-1">{{ $t('expenses.addParticipantsAbove') }}</p>
            <p v-else class="text-xs mt-1">{{ $t('expenses.tapToRecord') }}</p>
          </div>

          <!-- Expense rows -->
          <div v-else class="space-y-2">
            <div
              v-for="expense in expenses"
              :key="expense.id"
              class="group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border"
              :class="expense.participantIds.length < participants.length
                ? 'bg-violet-50 hover:bg-violet-100 border-violet-200 hover:border-violet-300'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-100 hover:border-slate-200'"
            >
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="font-medium text-slate-800 truncate leading-snug">{{ expense.description }}</p>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ $t('expenses.paidBy') }} <strong class="text-slate-600">{{ participantName(expense.payerId) }}</strong>
                  &middot;
                  split
                  <span v-if="expense.participantIds.length === participants.length">{{ $t('expenses.everyone') }}</span>
                  <span v-else>{{ expense.participantIds.map(id => participantName(id)).join(', ') }}</span>
                </p>
              </div>

              <!-- Inline delete confirmation -->
              <div v-if="deleteConfirmId === expense.id" class="flex items-center gap-1.5 flex-shrink-0">
                <span class="text-xs font-medium text-red-600">{{ $t('expenses.deleteConfirm') }}</span>
                <button @click="deleteExpense(expense.id)" class="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 px-2.5 py-1.5 rounded-md transition-colors">{{ $t('expenses.yes') }}</button>
                <button @click="cancelDelete" class="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md transition-colors">{{ $t('expenses.no') }}</button>
              </div>

              <!-- Amount + action buttons -->
              <div class="flex items-center gap-0.5 flex-shrink-0">
                <span class="font-semibold text-slate-800 mr-1 text-sm">{{ fmt(expense.amount) }}</span>
                <button
                  @click="openEditModal(expense)"
                  class="p-2 text-slate-400 hover:text-indigo-500 transition-colors rounded-lg"
                  :title="$t('expenses.editExpense')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                </button>
                <button
                  @click="confirmDelete(expense.id)"
                  class="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg"
                  :title="$t('expenses.deleteExpense')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Total row -->
            <div class="flex justify-between items-center pt-3 border-t border-slate-100 text-sm">
              <span class="text-slate-500">{{ $t('expenses.totalSpent') }}</span>
              <span class="font-bold text-slate-800">{{ fmt(totalSpent) }}</span>
            </div>
          </div>
        </div>
      </section>

    </div><!-- /left+centre col -->

    <!-- ──────────────────────────────────────────── Right: Results panel -->
    <div class="space-y-5">

      <!-- ═══════════════════════════════════════════════ BALANCES SECTION -->
      <section class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-700">{{ $t('balances.heading') }}</h2>
          <p class="text-xs text-slate-400 mt-0.5">{{ $t('balances.legend') }}</p>
        </div>
        <div class="p-5">
          <div v-if="participants.length === 0" class="text-center py-4 text-slate-400 text-sm">
            {{ $t('balances.emptyState') }}
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="p in participants"
              :key="p.id"
              class="flex items-center justify-between px-3 py-2.5 rounded-lg border"
              :class="{
                'bg-emerald-50 border-emerald-100': (balances[p.id] || 0) > 0.005,
                'bg-red-50   border-red-100':       (balances[p.id] || 0) < -0.005,
                'bg-slate-50 border-slate-100':     (balances[p.id] || 0) >= -0.005 && (balances[p.id] || 0) <= 0.005
              }"
            >
              <!-- Avatar + name -->
              <div class="flex items-center gap-2">
                <span
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  :class="{
                    'bg-emerald-200 text-emerald-700': (balances[p.id] || 0) > 0.005,
                    'bg-red-200    text-red-700':      (balances[p.id] || 0) < -0.005,
                    'bg-slate-200  text-slate-500':    (balances[p.id] || 0) >= -0.005 && (balances[p.id] || 0) <= 0.005
                  }"
                >{{ initial(p.name) }}</span>
                <span class="text-sm font-medium text-slate-700">{{ p.name }}</span>
              </div>
              <!-- Balance value -->
              <span
                class="text-sm font-semibold"
                :class="{
                  'text-emerald-600': (balances[p.id] || 0) > 0.005,
                  'text-red-600':     (balances[p.id] || 0) < -0.005,
                  'text-slate-400':   (balances[p.id] || 0) >= -0.005 && (balances[p.id] || 0) <= 0.005
                }"
              >
                <template v-if="(balances[p.id] || 0) > 0.005">+{{ fmt(balances[p.id]) }}</template>
                <template v-else-if="(balances[p.id] || 0) < -0.005">{{ fmt(balances[p.id]) }}</template>
                <template v-else>{{ $t('balances.settled') }}</template>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════ SPENDING SUMMARY SECTION -->
      <section v-if="hasData" class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-700">{{ $t('spendingSummary.heading') }}</h2>
          <p class="text-xs text-slate-400 mt-0.5">{{ $t('spendingSummary.subtitle') }}</p>
        </div>
        <div class="p-5 space-y-3">
          <div v-for="p in participants" :key="p.id">
            <!-- Name + totals row -->
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-1.5">
                <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{{ initial(p.name) }}</span>
                <span class="text-sm font-medium text-slate-700">{{ p.name }}</span>
              </div>
              <div class="text-xs text-slate-500 flex gap-3">
                <span>{{ $t('spendingSummary.paid') }} <strong class="text-slate-700">{{ fmt(spendingStats[p.id].paid) }}</strong></span>
                <span class="text-slate-300">|</span>
                <span>{{ $t('spendingSummary.share') }} <strong class="text-slate-700">{{ fmt(spendingStats[p.id].share) }}</strong></span>
              </div>
            </div>
            <!-- Progress bar: paid portion over total spent -->
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full bg-indigo-400 transition-all duration-300"
                :style="{ width: totalSpent > 0 ? (spendingStats[p.id].paid / totalSpent * 100).toFixed(1) + '%' : '0%' }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>{{ totalSpent > 0 ? (spendingStats[p.id].paid / totalSpent * 100).toFixed(0) : 0 }}{{ $t('spendingSummary.ofTotalPaid') }}</span>
              <span>{{ totalSpent > 0 ? (spendingStats[p.id].share / totalSpent * 100).toFixed(0) : 0 }}{{ $t('spendingSummary.ofTotalConsumed') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════ SETTLEMENTS SECTION -->
      <section class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-700 mb-3">{{ $t('settlements.heading') }}</h2>
          <!-- Mode toggle -->
          <div class="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
            <button
              @click="settlementMode = 'minimize'"
              class="flex-1 px-3 py-1.5 transition-colors"
              :class="settlementMode === 'minimize'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-500 hover:bg-slate-50'"
              :title="$t('settlements.fewestTitle')"
            >{{ $t('settlements.fewestPayments') }}</button>
            <button
              @click="settlementMode = 'direct'"
              class="flex-1 px-3 py-1.5 transition-colors border-l border-slate-200"
              :class="settlementMode === 'direct'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-500 hover:bg-slate-50'"
              :title="$t('settlements.directTitle')"
            >{{ $t('settlements.payDirectly') }}</button>
          </div>
        </div>
        <div class="p-5">

          <!-- No expenses yet -->
          <div v-if="!hasData" class="text-center py-4 text-slate-400 text-sm">
            {{ $t('settlements.emptyState') }}
          </div>

          <!-- All settled -->
          <div v-else-if="allSettled" class="text-center py-6">
            <div class="text-3xl mb-2">🎉</div>
            <p class="font-semibold text-emerald-600 text-sm">{{ $t('settlements.allSettled') }}</p>
          </div>

          <!-- Settlement transactions -->
          <div v-else class="space-y-2">
            <div
              v-for="(txn, i) in settlements"
              :key="i"
              class="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg"
            >
              <div class="flex items-center gap-1.5 text-sm min-w-0">
                <span class="font-medium text-slate-700 truncate">{{ participantName(txn.fromId) }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-amber-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
                <span class="font-medium text-slate-700 truncate">{{ participantName(txn.toId) }}</span>
              </div>
              <span class="font-bold text-amber-700 text-sm ml-2 flex-shrink-0">{{ fmt(txn.amount) }}</span>
            </div>
          </div>

        </div>
      </section>

    </div><!-- /right col -->

  </main>

  <!-- ══════════════════════════════════════ FAB — Add Expense (mobile only) -->
  <button
    v-if="participants.length > 0"
    @click="openAddModal"
    class="sm:hidden fixed bottom-6 right-6 z-20 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full shadow-xl flex items-center justify-center transition-colors"
    :title="$t('expenses.addExpense')"
    :aria-label="$t('expenses.addExpense')"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
    </svg>
  </button>

  <!-- ═══════════════════════════════════════════════════════════ ADD/EDIT MODAL -->
  <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">

      <!-- Drag handle (mobile bottom-sheet indicator) -->
      <div class="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden"></div>

      <!-- Modal header -->
      <div class="flex items-center justify-between mb-5">
        <h3 id="modal-title" class="text-lg font-semibold text-slate-800">
          {{ editingExpenseId ? $t('modal.editExpense') : $t('modal.newExpense') }}
        </h3>
        <button
          @click="closeModal"
          class="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg"
          :aria-label="$t('modal.close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <!-- Description -->
      <div class="mb-4">
        <label for="f-desc" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('modal.descriptionLabel') }}</label>
        <input
          id="f-desc"
          ref="descInput"
          v-model="form.description"
          @input="formError = ''"
          :placeholder="$t('modal.descriptionPlaceholder')"
          class="w-full border border-slate-300 rounded-lg px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
      </div>

      <!-- Amount -->
      <div class="mb-4">
        <label for="f-amount" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('modal.amountLabel') }}</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none pointer-events-none">
            {{ currency }}
          </span>
          <input
            id="f-amount"
            v-model="form.amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            @input="formError = ''"
            class="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Paid by -->
      <div class="mb-4">
        <label for="f-payer" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('modal.paidByLabel') }}</label>
        <select
          id="f-payer"
          v-model="form.payerId"
          @change="formError = ''"
          class="w-full border border-slate-300 rounded-lg px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white"
        >
          <option value="" disabled>{{ $t('modal.selectWhoPaid') }}</option>
          <option v-for="p in participants" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>

      <!-- Split between -->
      <div class="mb-5">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-slate-700">{{ $t('modal.splitBetween') }}</label>
          <div class="flex gap-2 text-xs">
            <button @click="selectAllParticipants" class="text-indigo-500 hover:text-indigo-700 font-medium transition-colors">{{ $t('modal.all') }}</button>
            <span class="text-slate-300">|</span>
            <button @click="clearAllParticipants" class="text-slate-400 hover:text-slate-600 transition-colors">{{ $t('modal.none') }}</button>
          </div>
        </div>

        <!-- Participant checkboxes -->
        <div class="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-0.5">
          <label
            v-for="p in participants"
            :key="p.id"
            class="flex items-center gap-2 p-3 rounded-lg border cursor-pointer select-none transition-colors min-h-[48px]"
            :class="form.participantIds.includes(p.id)
              ? 'bg-indigo-50 border-indigo-300'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'"
          >
            <input
              type="checkbox"
              v-model="form.participantIds"
              :value="p.id"
              class="accent-indigo-600 cursor-pointer flex-shrink-0 w-4 h-4"
            />
            <span
              class="text-sm font-medium truncate"
              :class="form.participantIds.includes(p.id) ? 'text-indigo-700' : 'text-slate-600'"
            >{{ p.name }}</span>
          </label>
        </div>

        <!-- Per-person share preview -->
        <p class="text-xs text-slate-400 mt-2">
          {{ $t('modal.selectedOf', { count: form.participantIds.length, total: participants.length }) }}
          <template v-if="sharePreview !== null">
            &middot; <strong class="text-slate-500">{{ fmt(sharePreview) }}</strong> {{ $t('modal.each') }}
          </template>
        </p>
      </div>

      <!-- Validation error -->
      <div v-if="formError" class="text-red-600 text-sm mb-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
        {{ formError }}
      </div>

      <!-- Action buttons — stacked on mobile, side-by-side on sm+ -->
      <div class="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
        <button
          @click="closeModal"
          class="py-3 sm:py-2 px-4 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors"
        >
          {{ $t('modal.cancel') }}
        </button>
        <button
          @click="saveExpense"
          class="py-3 sm:py-2 px-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {{ editingExpenseId ? $t('modal.saveChanges') : $t('modal.addExpense') }}
        </button>
      </div>

    </div>
  </div><!-- /modal -->

  <!-- ═══════════════════════════════════════════════════════════════ FOOTER -->
  <footer class="text-center py-6 mt-2">
    <a
      href="https://buymeacoffee.com/cahitihac"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 bg-[#FFDD00] hover:bg-[#ffcf00] active:bg-[#f5c400] text-[#000000] text-sm font-semibold px-4 py-2 rounded-full shadow-sm transition-colors"
    >
      <span class="text-base">☕</span>
      Buy me a coffee
    </a>
  </footer>

  </div><!-- /root -->
</template>

<script>
const STORAGE_KEY = 'reckoner-v1';
const LOCALE_KEY = 'reckoner-locale';
const SUPPORTED_LOCALES = ['en', 'tr', 'pl', 'ru', 'de', 'fr', 'it', 'es'];
const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'pl', flag: '🇵🇱', name: 'Polski' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
];

export default {
  name: 'App',

  data() {
    return {
      eventName: '',
      currency: 'zł',
      participants: [],
      expenses: [],

      // Language
      locale: (() => {
        try {
          const s = localStorage.getItem(LOCALE_KEY);
          if (s && SUPPORTED_LOCALES.includes(s)) return s;
          const b = (navigator.language || 'en').split('-')[0].toLowerCase();
          if (SUPPORTED_LOCALES.includes(b)) return b;
        } catch (_) {}
        return 'en';
      })(),
      languages: LANGUAGES,
      showLangMenu: false,

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
    currentLang() {
      return this.languages.find(l => l.code === this.locale) || this.languages[0];
    },

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

        if (bal[exp.payerId] !== undefined) {
          bal[exp.payerId] += exp.amount;
        }
        exp.participantIds.forEach(pid => {
          if (bal[pid] !== undefined) {
            bal[pid] -= share;
          }
        });
      });

      Object.keys(bal).forEach(id => {
        bal[id] = Math.round(bal[id] * 100) / 100;
      });
      return bal;
    },

    // Greedy minimum-transactions settlement
    minimizeSettlements() {
      const epsilon = 0.005;
      const creditors = [];
      const debtors = [];
      Object.entries(this.balances).forEach(([id, b]) => {
        if (b > epsilon) creditors.push({ id, balance: b });
        else if (b < -epsilon) debtors.push({ id, balance: -b });
      });

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
    expenses: { deep: true, handler() { this.persist(); } },
    locale(val) {
      this.$i18n.locale = val;
      try { localStorage.setItem(LOCALE_KEY, val); } catch (_) {}
    }
  },

  created() {
    this.restore();
    this.$i18n.locale = this.locale;
    if (!this.eventName) this.eventName = this.$t('defaults.eventName');
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
      return this.participantMap[id]?.name ?? this.$t('defaults.unknown');
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
        this.participantError = this.$t('errors.enterName');
        return;
      }
      if (this.participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        this.participantError = this.$t('errors.alreadyInList', { name });
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
        participantIds: this.participants.map(p => p.id)
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
        this.formError = this.$t('errors.enterDescription');
        return;
      }
      if (isNaN(amount) || amount <= 0) {
        this.formError = this.$t('errors.validAmount');
        return;
      }
      if (!this.form.payerId) {
        this.formError = this.$t('errors.selectPayer');
        return;
      }
      if (this.form.participantIds.length === 0) {
        this.formError = this.$t('errors.selectParticipants');
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
      if (confirm(this.$t('confirms.resetAll'))) {
        this.participants = [];
        this.expenses = [];
        this.eventName = this.$t('defaults.eventName');
        this.currency = 'zł';
        this.deleteConfirmId = null;
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      }
    }
  }
};
</script>
