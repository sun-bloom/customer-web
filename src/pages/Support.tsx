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
  getCustomerDeliveryEnquiriesApi,
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
  Truck,
  MapPin,
} from 'lucide-react';

const CATEGORIES = ['Order', 'Payment', 'Delivery', 'Product', 'Return / Refund', 'Other'];

export const Support: React.FC = () => {
  const { user, token } = useAuth();

  // Tabs: 'my-queries' | 'create-query' | 'conversation'
  const [activeTab, setActiveTab] = useState<'my-queries' | 'create-query' | 'conversation'>('my-queries');

  // Queries list state
  const [queries, setQueries] = useState<CustomerQuery[]>([]);
  const [loadingQueries, setLoadingQueries] = useState(false);

  // Delivery Enquiries list state
  const [deliveryEnquiries, setDeliveryEnquiries] = useState<any[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [queriesSubTab, setQueriesSubTab] = useState<'tickets' | 'delivery'>('tickets');

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

  // Load delivery enquiries
  const loadDeliveryEnquiries = async () => {
    if (!token) return;
    setLoadingEnquiries(true);
    try {
      const res = await getCustomerDeliveryEnquiriesApi(token);
      setDeliveryEnquiries(res.enquiries || []);
    } catch (err) {
      console.warn('Failed to load delivery enquiries:', err);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadQueries();
      loadOrders();
      loadDeliveryEnquiries();
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

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERY_AVAILABLE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Delivery Confirmed
          </span>
        );
      case 'DELIVERY_UNAVAILABLE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Location Unavailable
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Team Contacted
          </span>
        );
      case 'CONVERTED_TO_ORDER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Converted to Order
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
            Closed
          </span>
        );
      case 'PENDING':
      case 'NEW':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF9F5] py-8 md:py-14 relative overflow-hidden">
      <div className="absolute top-0 right-10 w-96 h-96 rounded-full bg-[#FCE7EC]/35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#FAF5EB]/50 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A223B] font-semibold block mb-2">
            Atelier Concierge & Support
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-normal text-[#2A1C19]">
            Customer <span className="font-serif italic text-rose-gold-gradient">Support & Queries</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7D6460] font-light mt-2">
            Track inquiries, get direct assistance from our jewellery concierge, or submit an order issue.
          </p>
        </div>

        {/* Tab Switcher (When not in full conversation) */}
        {activeTab !== 'conversation' && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-xl bg-white border border-[#E8DCCF] p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('my-queries')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'my-queries'
                    ? 'bg-[#7A223B] text-[#FFF6FA] shadow-xs'
                    : 'text-[#7D6460] hover:text-[#2A1C19]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#DFC598]" />
                <span>My Queries ({queries.length + deliveryEnquiries.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('create-query')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'create-query'
                    ? 'bg-[#7A223B] text-[#FFF6FA] shadow-xs'
                    : 'text-[#7D6460] hover:text-[#2A1C19]'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#DFC598]" />
                <span>New Query</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: MY QUERIES LIST */}
        {/* ========================================================================= */}
        {activeTab === 'my-queries' && (
          <div className="space-y-5">
            {/* Sub-tab selection between Support Tickets and Delivery Location Enquiries */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-1">
              <div className="inline-flex rounded-xl bg-white border border-[#E8DCCF] p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQueriesSubTab('tickets')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    queriesSubTab === 'tickets'
                      ? 'bg-[#7A223B] text-[#FFF6FA] shadow-xs'
                      : 'text-[#7D6460] hover:text-[#2A1C19]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Support Tickets ({queries.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQueriesSubTab('delivery')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    queriesSubTab === 'delivery'
                      ? 'bg-[#7A223B] text-[#FFF6FA] shadow-xs'
                      : 'text-[#7D6460] hover:text-[#2A1C19]'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Delivery Enquiries ({deliveryEnquiries.length})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  loadQueries();
                  loadDeliveryEnquiries();
                }}
                className="text-xs text-[#7A223B] hover:text-[#5E182C] flex items-center gap-1 font-medium cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingQueries || loadingEnquiries ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* SUB-TAB A: SUPPORT TICKETS */}
            {queriesSubTab === 'tickets' && (
              <>
                {loadingQueries ? (
                  <div className="p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] text-[#7D6460] text-sm flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#7A223B]" />
                    <span>Loading your inquiries...</span>
                  </div>
                ) : queries.length === 0 ? (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-10 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#FDF2F5] border border-[#FCE7EC] flex items-center justify-center mx-auto text-[#7A223B]">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg text-[#2A1C19]">No Support Queries Yet</h3>
                      <p className="text-xs text-[#7D6460] mt-1 max-w-sm mx-auto">
                        Have an issue with delivery, a payment query, or product question? Submit a ticket and our team will assist you.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('create-query')}
                      className="btn-rose-primary px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
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
                        className="bg-white rounded-2xl border border-[#E8DCCF] p-5 hover:border-[#DFC598] hover:shadow-xs transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#7A223B] bg-[#FDF2F5] border border-[#FCE7EC] px-2 py-0.5 rounded">
                              {q.queryNumber}
                            </span>
                            <span className="text-xs font-medium bg-[#FAF6F0] text-[#5C4540] border border-[#E8DCCF] px-2 py-0.5 rounded">
                              {q.category}
                            </span>
                            {getStatusBadge(q.status)}
                            {q.order && (
                              <span className="text-xs text-[#7D6460] bg-white border border-[#E8DCCF] px-2 py-0.5 rounded flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3 text-[#C9A86A]" />
                                #{q.order.orderNumber}
                              </span>
                            )}
                          </div>

                          <h3 className="font-heading text-base text-[#2A1C19] group-hover:text-[#7A223B] transition-colors truncate">
                            {q.subject}
                          </h3>

                          <p className="text-xs text-[#A8928D] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Last updated {new Date(q.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                          <span className="text-xs text-[#A8928D] flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {q._count?.messages || 1} messages
                          </span>
                          <span className="text-xs font-semibold text-[#7A223B] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Open Conversation <ChevronRight className="w-4 h-4 text-[#C9A86A]" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* SUB-TAB B: DELIVERY LOCATION ENQUIRIES */}
            {queriesSubTab === 'delivery' && (
              <>
                {loadingEnquiries ? (
                  <div className="p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] text-[#7D6460] text-sm flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#7A223B]" />
                    <span>Loading your delivery enquiries...</span>
                  </div>
                ) : deliveryEnquiries.length === 0 ? (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-10 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#FAF5EB] border border-[#E8DCCF] flex items-center justify-center mx-auto text-[#7A223B]">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg text-[#2A1C19]">No Delivery Enquiries Submitted</h3>
                      <p className="text-xs text-[#7D6460] mt-1 max-w-sm mx-auto">
                        If a delivery destination needs confirmation during checkout, you can raise an enquiry and track its approval status here.
                      </p>
                    </div>
                    <Link
                      to="/cart"
                      className="btn-rose-primary inline-block px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      View Shopping Bag
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deliveryEnquiries.map((enq) => {
                      const isAvailable = enq.status === 'DELIVERY_AVAILABLE';
                      const isUnavailable = enq.status === 'DELIVERY_UNAVAILABLE';
                      return (
                        <div
                          key={enq.id}
                          className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all space-y-3.5 ${
                            isAvailable
                              ? 'border-emerald-300 shadow-xs ring-1 ring-emerald-200'
                              : isUnavailable
                              ? 'border-red-200'
                              : 'border-[#E8DCCF]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DCCF]/60">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-[#2A1C19]">
                                  {enq.city}, {enq.state}
                                </span>
                                <span className="font-mono text-xs font-semibold text-[#7A223B] bg-[#FDF2F5] border border-[#FCE7EC] px-2 py-0.5 rounded">
                                  PIN: {enq.pincode}
                                </span>
                                {getDeliveryStatusBadge(enq.status)}
                              </div>
                              <p className="text-[11px] text-[#A8928D] mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Requested on {new Date(enq.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                              </p>
                            </div>

                            {/* Direct Action when delivery is confirmed */}
                            {isAvailable && (
                              <Link
                                to="/payment"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs transition-all self-start sm:self-auto cursor-pointer"
                              >
                                <span>Proceed to Checkout</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>

                          {/* Address and Hierarchy */}
                          <div className="text-xs text-[#5C4540] space-y-1">
                            <p className="flex items-start gap-1 text-[#7D6460]">
                              <MapPin className="w-3.5 h-3.5 text-[#7A223B] mt-0.5 flex-shrink-0" />
                              <span>{enq.address}</span>
                            </p>
                          </div>

                          {/* Cart items attached */}
                          {Array.isArray(enq.cartItems) && enq.cartItems.length > 0 && (
                            <div className="bg-[#FAF6F0]/60 rounded-xl p-3 border border-[#E8DCCF]/60 text-xs">
                              <div className="flex items-center justify-between pb-1.5 border-b border-[#E8DCCF]/40 font-medium text-[#2A1C19]">
                                <span className="flex items-center gap-1.5">
                                  <ShoppingBag className="w-3.5 h-3.5 text-[#C9A86A]" /> Requested Bag Items
                                </span>
                                {enq.subtotal != null && (
                                  <span className="font-semibold text-[#7A223B]">
                                    Est. Value: ₹{Number(enq.subtotal).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {enq.cartItems.map((item: any, idx: number) => (
                                  <div key={item.variantId || idx} className="flex items-center justify-between text-[11px] text-[#5C4540]">
                                    <span className="truncate max-w-[200px]">{item.productName || 'Jewellery Creation'}</span>
                                    <span className="font-mono text-[#A8928D]">Qty: {item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Status Context Guidance Message */}
                          <div className="pt-1">
                            {isAvailable ? (
                              <p className="text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                                <strong>Delivery Verified:</strong> Our logistics atelier has confirmed service availability for your destination. Click &ldquo;Proceed to Checkout&rdquo; above to place your order.
                              </p>
                            ) : isUnavailable ? (
                              <p className="text-xs text-red-800 bg-red-50/70 p-2.5 rounded-lg border border-red-200">
                                <strong>Location Notice:</strong> Courier partner coverage is currently not available for this postal code. Please contact concierge support if you have an alternative delivery address.
                              </p>
                            ) : (
                              <p className="text-xs text-amber-800 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200">
                                <strong>Under Review:</strong> Our dispatch team is verifying courier partner coverage for this address. Once approved, the status will update here automatically.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CREATE NEW QUERY FORM */}
        {/* ========================================================================= */}
        {activeTab === 'create-query' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-6 sm:p-10 shadow-xs max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-normal text-[#2A1C19]">
                Submit Support Request
              </h2>
              <p className="text-xs text-[#7D6460] mt-1">
                Fill in the details below and our team will get back to you with updates on this ticket.
              </p>
            </div>

            {createSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <span>{createSuccess}</span>
              </div>
            )}

            {createError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateQuery} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540] mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B]"
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540] mb-1.5 flex items-center justify-between">
                  <span>Related Order (Optional)</span>
                  <span className="text-[10px] text-[#A8928D] font-normal">
                    {orders.length} orders found
                  </span>
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B]"
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540] mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Delivery status update for my bangles"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B]"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540] mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your query with any relevant details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B] resize-y"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {queries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('my-queries')}
                    className="text-xs text-[#7D6460] hover:text-[#2A1C19] cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-rose-primary ml-auto px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
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
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A223B] hover:text-[#5E182C] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Queries</span>
            </button>

            {loadingConversation || !activeQuery ? (
              <div className="p-16 text-center bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] text-[#7D6460] text-sm flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#7A223B]" />
                <span>Loading ticket conversation...</span>
              </div>
            ) : (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] overflow-hidden shadow-xs">
                {/* Conversation Header */}
                <div className="p-6 sm:p-8 bg-[#FAF6F0]/60 border-b border-[#E8DCCF] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#7A223B] bg-white border border-[#FCE7EC] px-2.5 py-1 rounded-md">
                        {activeQuery.queryNumber}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-[#E8DCCF] text-[#5C4540]">
                        {activeQuery.category}
                      </span>
                      {getStatusBadge(activeQuery.status)}
                    </div>
                    <span className="text-xs text-[#A8928D]">
                      Submitted on {new Date(activeQuery.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  </div>

                  <h2 className="font-heading text-xl sm:text-2xl text-[#2A1C19]">
                    {activeQuery.subject}
                  </h2>

                  {/* Linked Order Card if any */}
                  {activeQuery.order && (
                    <div className="p-3.5 rounded-xl bg-white border border-[#E8DCCF] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-[#C9A86A]" />
                        <span className="font-semibold text-[#2A1C19]">
                          Linked Order #{activeQuery.order.orderNumber}
                        </span>
                        <span className="text-[#A8928D]">· ₹{activeQuery.order.totalAmount}</span>
                      </div>
                      <Link
                        to={`/orders/${activeQuery.order.id}`}
                        className="text-[#7A223B] font-medium hover:underline flex items-center gap-0.5"
                      >
                        View Order <ExternalLink className="w-3 h-3 text-[#C9A86A]" />
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
                                ? 'bg-[#7A223B] text-[#FFF6FA] rounded-tr-xs'
                                : 'bg-[#FAF6F0] border border-[#E8DCCF] text-[#2A1C19] rounded-tl-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4 text-xs">
                              <span
                                className={`font-semibold flex items-center gap-1 ${
                                  isCustomer ? 'text-[#DFC598]' : 'text-[#7A223B]'
                                }`}
                              >
                                {!isCustomer && <Headphones className="w-3.5 h-3.5" />}
                                {isCustomer ? 'You' : 'Sunbloom Concierge Team'}
                              </span>
                              <span
                                className={`text-[10px] ${
                                  isCustomer ? 'text-[#FCE7EC]/70' : 'text-[#A8928D]'
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
                    <p className="text-center text-xs text-[#A8928D] py-4">No messages yet.</p>
                  )}
                </div>

                {/* Reply Form */}
                <div className="p-6 sm:p-8 bg-[#FAF6F0]/40 border-t border-[#E8DCCF] space-y-3">
                  {activeQuery.status === 'CLOSED' ? (
                    <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200 text-center text-xs text-[#7D6460]">
                      This ticket has been marked as <strong>Closed</strong>. If you require further assistance, please{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('create-query')}
                        className="text-[#7A223B] font-semibold underline cursor-pointer"
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
                          className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCCF] text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B] resize-y"
                        />

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[#A8928D]">
                            Our concierge typically responds within a few business hours.
                          </span>

                          <button
                            type="submit"
                            disabled={sendingReply || !replyText.trim()}
                            className="btn-rose-primary px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
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
        <div className="mt-12 p-5 rounded-2xl bg-[#FDF2F5] border border-[#FCE7EC] flex items-start gap-3 text-xs text-[#7A223B] max-w-2xl mx-auto">
          <Video className="w-5 h-5 flex-shrink-0 text-[#7A223B] mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold uppercase tracking-wider text-[#7A223B] text-[11px]">
              Important Return / Replacement Guideline
            </p>
            <p className="text-[#7D6460] leading-relaxed text-xs">
              For queries related to transit damage or missing items, please keep your clear, uncut package unboxing video ready as required by atelier policy.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Support;
