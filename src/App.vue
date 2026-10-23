<script setup lang="ts">
import { computed, ref } from 'vue';
import { LayoutDashboard, ReceiptText, Search, Plus, Download, X, Menu, Filter } from 'lucide-vue-next';
import { starterInvoices, money, validateInvoice, toCSV } from './data/records';
import type { Invoice, Status } from './data/records';

const records=ref<Invoice[]>([...starterInvoices]);
const term=ref('');
const status=ref('All');
const sort=ref('newest');
const showModal=ref(false);
const mobileNav=ref(false);
const error=ref('');
const toast=ref('');
const client=ref('');
const service=ref('');
const amount=ref('');
const invoiceStatus=ref<Status>('Pending');

const filtered=computed(()=>{
 const q=term.value.trim().toLowerCase();
 return records.value.filter(i=>(status.value==='All'||i.status===status.value)&&
  (!q||[i.id,i.client,i.service].some(x=>x.toLowerCase().includes(q))))
 .sort((a,b)=>sort.value==='amount-high'?b.amount-a.amount:sort.value==='amount-low'?a.amount-b.amount:sort.value==='oldest'?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
});
const total=computed(()=>records.value.reduce((n,i)=>n+i.amount,0));
const paid=computed(()=>records.value.filter(i=>i.status==='Paid').reduce((n,i)=>n+i.amount,0));
const outstanding=computed(()=>records.value.filter(i=>i.status!=='Paid').reduce((n,i)=>n+i.amount,0));
function addInvoice(){
 error.value=validateInvoice(client.value,service.value,amount.value)??'';
 if(error.value) return;
 const next=Math.max(1046,...records.value.map(i=>Number(i.id.replace('INV-',''))||0))+1;
 records.value.unshift({id:'INV-'+next,client:client.value.trim(),service:service.value.trim(),amount:Number(amount.value),status:invoiceStatus.value,date:new Date().toISOString().slice(0,10)});
 client.value='';service.value='';amount.value='';invoiceStatus.value='Pending';
 showModal.value=false; toast.value='Invoice added to demo data.';
}
function exportCsv(){
 const csv=toCSV(filtered.value);
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='ledger-invoices.csv';a.click();URL.revokeObjectURL(url);
}
</script>

<template>
<div class="shell">
  <aside class="sidebar" :class="{open:mobileNav}">
    <div class="brand"><span class="brand-icon">L</span><span>ledger<span class="brand-dot">.</span></span></div>
    <div class="side-label">WORKSPACE</div>
    <nav>
      <a class="nav-link active" href="#overview" @click="mobileNav=false"><LayoutDashboard :size="18"/> Overview</a>
      <a class="nav-link" href="#invoices" @click="mobileNav=false"><ReceiptText :size="18"/> Invoices</a>
    </nav>
    <div class="side-bottom"><div class="avatar">AM</div><div><strong>Demo workspace</strong><small>Portfolio preview</small></div></div>
  </aside>
  <main class="main">
    <header class="topbar">
      <button class="icon-button mobile-only" aria-label="Open navigation" @click="mobileNav=!mobileNav"><Menu :size="20"/></button>
      <div class="breadcrumb">Workspace <span>/</span> Overview</div><div class="top-right"><span class="demo-pill">● Demo environment</span><div class="avatar small">AM</div></div>
    </header>
    <div class="content" id="overview">
      <div class="heading"><div><div class="eyebrow">FRIDAY, OCTOBER 23, 2026</div><h1>Financial overview</h1><p>Track invoices and monitor your business at a glance.</p></div><button class="primary" @click="showModal=true"><Plus :size="18"/> New invoice</button></div>
      <section class="stats" aria-label="Invoice summaries">
        <div class="stat"><div class="stat-label">Total invoiced</div><div class="stat-value">{{money(total)}}</div><div class="stat-detail">Across {{records.length}} invoices</div></div>
        <div class="stat"><div class="stat-label">Paid revenue</div><div class="stat-value">{{money(paid)}}</div><div class="stat-detail success">● Completed payments (demo)</div></div>
        <div class="stat"><div class="stat-label">Outstanding</div><div class="stat-value">{{money(outstanding)}}</div><div class="stat-detail">Pending and overdue amounts</div></div>
      </section>
      <section class="panel" id="invoices">
        <div class="panel-heading"><div><h2>Invoices</h2><p>Manage and review your invoice records</p></div><button class="secondary" @click="exportCsv"><Download :size="16"/> Export CSV</button></div>
        <div class="toolbar">
          <label class="search-field"><Search :size="17"/><input v-model="term" placeholder="Search invoices, clients, services..." aria-label="Search invoices"/></label>
          <label class="select-field"><Filter :size="16"/><select v-model="status" aria-label="Filter by status"><option>All</option><option>Paid</option><option>Pending</option><option>Overdue</option></select></label>
          <select class="sort" v-model="sort" aria-label="Sort invoices"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="amount-high">Amount: high to low</option><option value="amount-low">Amount: low to high</option></select>
        </div>
        <div class="table-wrap"><table><thead><tr><th>INVOICE</th><th>CLIENT</th><th>SERVICE</th><th>DATE</th><th>STATUS</th><th class="right">AMOUNT</th></tr></thead>
        <tbody><tr v-for="i in filtered" :key="i.id"><td class="id">{{i.id}}</td><td class="client">{{i.client}}</td><td>{{i.service}}</td><td>{{i.date}}</td><td><span class="status" :class="i.status.toLowerCase()"><span>●</span> {{i.status}}</span></td><td class="right amount">{{money(i.amount)}}</td></tr><tr v-if="filtered.length===0"><td colspan="6" class="empty">No invoices match the current filters.</td></tr></tbody></table></div>
        <footer class="table-footer">Showing {{filtered.length}} of {{records.length}} invoices <span>Fictional portfolio data</span></footer>
      </section>
      <p class="disclaimer">Ledger is a frontend-only portfolio demonstration. No real financial transactions are processed.</p>
    </div>
  </main>
  <div v-if="showModal" class="overlay" @click.self="showModal=false">
    <form class="modal" @submit.prevent="addInvoice">
      <div class="modal-head"><div><h2>Create invoice</h2><p>Add an entry to the demo workspace</p></div><button type="button" class="icon-button" aria-label="Close dialog" @click="showModal=false"><X :size="20"/></button></div>
      <label>Client name<input v-model="client" placeholder="e.g. Acme Studio"/></label>
      <label>Service<input v-model="service" placeholder="e.g. API integration"/></label>
      <label>Amount (USD)<input v-model="amount" type="number" min="0.01" step="0.01" placeholder="0.00"/></label>
      <label>Status<select v-model="invoiceStatus"><option>Pending</option><option>Paid</option><option>Overdue</option></select></label>
      <p v-if="error" class="form-error" role="alert">{{error}}</p>
      <div class="modal-actions"><button type="button" class="secondary" @click="showModal=false">Cancel</button><button class="primary" type="submit">Create invoice</button></div>
    </form>
  </div>
  <div v-if="toast" role="status" class="toast" @click="toast=''">{{toast}} <X :size="14"/></div>
</div>
</template>
