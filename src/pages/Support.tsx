// src/pages/Support.tsx
// Comprehensive Customer Support & Query System for Sunbloom Adorn

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  createCustomerQueryApi,
  getCustomerQueriesApi,
  getCustomerQueryByIdApi,
  sendCustomerQueryReplyApi,
  getCustomerOrdersApi,
} from '../lib/api';
import type { CustomerQuery, Order } from '../types';
import {
  HelpCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
  PlusCircle,
  ShoppingBag,
  ArrowLeft,
  RefreshCw,
  Video,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Headphones,
} from 'lucide-react';

const CATEGORIES = ['Order', 'Payment', 'Delivery', 'Product', 'Return / Refund', 'Other'];

export const Support: React.FC = () => {
  const { user, token } = useAuth();

  // Tabs: 'my-queries' | 'create-query' | 'conversation'
  const [activeTab, setActiveTab] = useState<'my-queries' | 'create-query' | 'conversation'>('my-queries');

  // Queries list state
  const [queries, setQueries] = useState<CustomerQuery[]>([]);
  const [loadingQueries, setLoadingQueries] = useState(false);

  // Customer orders (for linking to queries)
  const [orders, setOrders] = useState<Order[]>([]);

  // Create Query Form State
  const [category, setCategory] = useState('Order');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Active Query Conversation State
  const [activeQueryId, setActiveQueryId] = useState<string | null>(null);
  const [activeQuery, setActiveQuery] = useState<CustomerQuery | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Load customer queries
  const loadQueries = async () => {
    if (!token) return;
    setLoadingQueries(true);
    try {
      const res = await getCustomerQueriesApi(token);
      setQueries(res.queries || []);
      // If user has no queries, default to create-query tab
      if (!res.queries || res.queries.length === 0) {
        setActiveTab('create-query');
      }
    } catch (err) {
      console.error('Failed to load customer queries:', err);
    } finally {
      setLoadingQueries(false);
    }
  };

  // Load customer orders for linking
  const loadOrders = async () => {
    if (!token) return;
    try {
      const res = await getCustomerOrdersApi(token);
      setOrders(res.orders || []);
    } catch (err) {
      console.warn('Failed to load orders for query linking:', err);
    }
  };

  useEffect(() => {
    if (token) {
      loadQueries();
      loadOrders();
    }
  }, [token]);

  // View specific query conversation
  const openConversation = async (queryId: string) => {
    if (!token) return;
    setActiveQueryId(queryId);
    setActiveTab('conversation');
    setLoadingConversation(true);
    setReplyError(null);
    setReplyText('');

    try {
      const res = await getCustomerQueryByIdApi(queryId, token);
      setActiveQuery(res.query);
    } catch (err: any) {
      console.error('Failed to load conversation:', err);
      setReplyError(err.message || 'Could not load query details.');
    } finally {
      setLoadingConversation(false);
    }
  };

  // Submit new query
  const handleCreateQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreateError(null);
    setCreateSuccess(null);

    if (!subject.trim() || !message.trim()) {
      setCreateError('Please enter a subject and describe your request.');
      return;
    }

    setCreating(true);

    try {
      const res = await createCustomerQueryApi(
        {
          category,
          subject: subject.trim(),
          message: message.trim(),
          orderId: selectedOrderId || undefined,
          priority,
        },
        token
      );

      setCreateSuccess(`Query ticket #${res.query.queryNumber} was created successfully!`);
      setSubject('');
      setMessage('');
      setSelectedOrderId('');

      // Reload queries list and switch to the new conversation
      await loadQueries();
      openConversation(res.query.id);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to submit query. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Customer replies to query
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeQueryId || !replyText.trim()) return;

    setSendingReply(true);
    setReplyError(null);

    try {
      await sendCustomerQueryReplyApi(activeQueryId, replyText.trim(), token);
      setReplyText('');

      // Refresh current conversation
      const refreshed = await getCustomerQueryByIdApi(activeQueryId, token);
      setActiveQuery(refreshed.query);

      // Refresh list in background
      loadQueries();
    } catch (err: any) {
      setReplyError(err.message || 'Failed to send your reply.');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Open
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            In Progress
          </span>
        );
      case 'WAITING_FOR_CUSTOMER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 animate-pulse">
            Action Required: Reply Received
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolved
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
            Closed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 md:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-semibold block mb-2">
            Atelier Concierge & Support
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-normal text-[#1C1612]">
            Customer <span className="font-serif italic text-[#C5A059]">Support & Queries</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7063] font-light mt-2">
            Track inquiries, get direct assistance from our jewellery concierge, or submit an order issue.
          </p>
        </div>

        {/* Tab Switcher (When not in full conversation) */}
        {activeTab !== 'conversation' && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-2xl bg-white border border-[#E8E1D5] p-1.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('my-queries')}
                className={`px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'my-queries'
                    ? 'bg-[#1C1612] text-[#FAF7F2] shadow-xs'
                    : 'text-[#7D7063] hover:text-[#1C1612]'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-[#C5A059]" />
                <span>My Queries ({queries.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('create-query')}
                className={`px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'create-query'
                    ? 'bg-[#1C1612] text-[#FAF7F2] shadow-xs'
                    : 'text-[#7D7063] hover:text-[#1C1612]'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-[#C5A059]" />
                <span>New Query</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: MY QUERIES LIST */}
        {/* ========================================================================= */}
        {activeTab === 'my-queries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#5C5248]">
                Your Submitted Support Tickets
              </h2>
              <button
                type="button"
                onClick={loadQueries}
                className="text-xs text-[#7D7063] hover:text-[#1C1612] flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingQueries ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingQueries ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E8E1D5] text-[#7D7063] text-sm flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#C5A059]" />
                <span>Loading your inquiries...</span>
              </div>
            ) : queries.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E8E1D5] p-10 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center mx-auto text-[#C5A059]">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg text-[#1C1612]">No Support Queries Yet</h3>
                  <p className="text-xs text-[#7D7063] mt-1 max-w-sm mx-auto">
                    Have an issue with delivery, a payment query, or product question? Submit a ticket and our team will assist you.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('create-query')}
                  className="px-6 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b08e4c] text-[#1C1612] text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  Create Your First Query
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {queries.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => openConversation(q.id)}
                    className="bg-white rounded-2xl border border-[#E8E1D5] p-5 hover:border-[#C5A059] hover:shadow-xs transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded">
                          {q.queryNumber}
                        </span>
                        <span className="text-xs font-medium bg-[#FAF7F2] text-[#5C5248] border border-[#E8E1D5] px-2 py-0.5 rounded">
                          {q.category}
                        </span>
                        {getStatusBadge(q.status)}
                        {q.order && (
                          <span className="text-xs text-[#7D7063] bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3 text-[#C5A059]" />
                            #{q.order.orderNumber}
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading text-base text-[#1C1612] group-hover:text-[#C5A059] transition-colors truncate">
                        {q.subject}
                      </h3>

                      <p className="text-xs text-[#7D7063] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Last updated {new Date(q.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <span className="text-xs text-[#7D7063] flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {q._count?.messages || 1} messages
                      </span>
                      <span className="text-xs font-semibold text-[#C5A059] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Open Conversation <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CREATE NEW QUERY FORM */}
        {/* ========================================================================= */}
        {activeTab === 'create-query' && (
          <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-10 shadow-xs max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-normal text-[#1C1612]">
                Submit Support Request
              </h2>
              <p className="text-xs text-[#7D7063] mt-1">
                Fill in the details below and our team will get back to you with updates on this ticket.
              </p>
            </div>

            {createSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <span>{createSuccess}</span>
              </div>
            )}

            {createError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateQuery} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Linked Order (Optional) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5 flex items-center justify-between">
                  <span>Related Order (Optional)</span>
                  <span className="text-[10px] text-[#7D7063] font-normal">
                    {orders.length} orders found
                  </span>
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="">-- No specific order / General inquiry --</option>
                  {orders.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      Order #{ord.orderNumber} · ₹{ord.totalAmount} · ({ord.status || ord.orderStatus || 'CONFIRMED'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Delivery status update for my bangles"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your query with any relevant details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059] resize-y"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {queries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('my-queries')}
                    className="text-xs text-[#7D7063] hover:text-[#1C1612]"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={creating}
                  className="ml-auto px-6 py-3 rounded-xl bg-[#C5A059] hover:bg-[#b08e4c] text-[#1C1612] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{creating ? 'Submitting...' : 'Submit Query'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CONVERSATION VIEW & TICKET REPLIES */}
        {/* ========================================================================= */}
        {activeTab === 'conversation' && (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setActiveTab('my-queries')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7D7063] hover:text-[#1C1612] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Queries</span>
            </button>

            {loadingConversation || !activeQuery ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-[#E8E1D5] text-[#7D7063] text-sm flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#C5A059]" />
                <span>Loading ticket conversation...</span>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#E8E1D5] overflow-hidden shadow-xs">
                {/* Conversation Header */}
                <div className="p-6 sm:p-8 bg-[#FAF7F2] border-b border-[#E8E1D5] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#C5A059] bg-white border border-[#C5A059]/30 px-2.5 py-1 rounded-md">
                        {activeQuery.queryNumber}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-[#E8E1D5] text-[#5C5248]">
                        {activeQuery.category}
                      </span>
                      {getStatusBadge(activeQuery.status)}
                    </div>
                    <span className="text-xs text-[#7D7063]">
                      Submitted on {new Date(activeQuery.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  </div>

                  <h2 className="font-heading text-xl sm:text-2xl text-[#1C1612]">
                    {activeQuery.subject}
                  </h2>

                  {/* Linked Order Card if any */}
                  {activeQuery.order && (
                    <div className="p-3.5 rounded-xl bg-white border border-[#E8E1D5] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                        <span className="font-semibold text-[#1C1612]">
                          Linked Order #{activeQuery.order.orderNumber}
                        </span>
                        <span className="text-[#7D7063]">· ₹{activeQuery.order.totalAmount}</span>
                      </div>
                      <Link
                        to={`/orders/${activeQuery.order.id}`}
                        className="text-[#C5A059] font-medium hover:underline flex items-center gap-0.5"
                      >
                        View Order <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Conversation Messages Thread */}
                <div className="p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto">
                  {activeQuery.messages && activeQuery.messages.length > 0 ? (
                    activeQuery.messages.map((msg) => {
                      const isCustomer = msg.senderType === 'CUSTOMER';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            isCustomer ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div
                            className={`max-w-xl rounded-2xl p-4 sm:p-5 space-y-1.5 shadow-2xs ${
                              isCustomer
                                ? 'bg-[#1C1612] text-[#FAF7F2] rounded-tr-xs'
                                : 'bg-[#FAF7F2] border border-[#E8E1D5] text-[#1C1612] rounded-tl-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4 text-xs">
                              <span
                                className={`font-semibold flex items-center gap-1 ${
                                  isCustomer ? 'text-[#C5A059]' : 'text-[#8C6D23]'
                                }`}
                              >
                                {!isCustomer && <Headphones className="w-3.5 h-3.5" />}
                                {isCustomer ? 'You' : 'Sunbloom Concierge Team'}
                              </span>
                              <span
                                className={`text-[10px] ${
                                  isCustomer ? 'text-neutral-400' : 'text-[#7D7063]'
                                }`}
                              >
                                {new Date(msg.createdAt).toLocaleString('en-IN', {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-xs text-[#7D7063] py-4">No messages yet.</p>
                  )}
                </div>

                {/* Reply Form */}
                <div className="p-6 sm:p-8 bg-[#FAF7F2]/50 border-t border-[#E8E1D5] space-y-3">
                  {activeQuery.status === 'CLOSED' ? (
                    <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200 text-center text-xs text-[#7D7063]">
                      This ticket has been marked as <strong>Closed</strong>. If you require further assistance, please{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('create-query')}
                        className="text-[#C5A059] font-semibold underline"
                      >
                        open a new query
                      </button>
                      .
                    </div>
                  ) : (
                    <>
                      {replyError && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span>{replyError}</span>
                        </div>
                      )}

                      <form onSubmit={handleSendReply} className="space-y-3">
                        <textarea
                          required
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply to our concierge team..."
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059] resize-y"
                        />

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[#7D7063]">
                            Our concierge typically responds within a few business hours.
                          </span>

                          <button
                            type="submit"
                            disabled={sendingReply || !replyText.trim()}
                            className="px-5 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b08e4c] text-[#1C1612] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{sendingReply ? 'Sending...' : 'Send Reply'}</span>
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Unboxing Video Guideline Reminder */}
        <div className="mt-12 p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-800 max-w-2xl mx-auto">
          <Video className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold uppercase tracking-wider text-amber-900 text-[11px]">
              Important Return / Replacement Guideline
            </p>
            <p className="text-amber-700 leading-relaxed text-xs">
              For queries related to transit damage or missing items, please keep your clear, uncut package unboxing video ready as required by atelier policy.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Support;
