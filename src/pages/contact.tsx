import { useState } from "react";
import {
  Mail,
  Search,
  Eye,
  MoreHorizontal,
  Archive,
  Check,
  Reply,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  created_at: string;
};

const DEMO_MESSAGES: ContactMessage[] = [
  {
    id: "1",
    name: "Sofia Laurent",
    email: "sofia@example.com",
    subject: "Private Viewing",
    message:
      "I would love to arrange a private viewing of your latest collection. Could you please let me know what dates are available?",
    status: "new",
    created_at: "2026-08-27T10:30:00",
  },
  {
    id: "2",
    name: "James Wilson",
    email: "james@example.com",
    subject: "Bespoke Commission",
    message:
      "I am interested in commissioning a bespoke piece and would like to discuss the available options.",
    status: "read",
    created_at: "2026-08-26T15:20:00",
  },
  {
    id: "3",
    name: "Amelia Rose",
    email: "amelia@example.com",
    subject: "Collection Inquiry",
    message:
      "Could you provide more information about the Maison collection?",
    status: "replied",
    created_at: "2026-08-25T11:45:00",
  },
];

function statusStyles(status: ContactMessage["status"]) {
  switch (status) {
    case "new":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";

    case "read":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";

    case "replied":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

    case "archived":
      return "bg-muted text-muted-foreground border-border";

    default:
      return "";
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ContactMessagesPage() {
  const [messages, setMessages] =
    useState<ContactMessage[]>(DEMO_MESSAGES);

  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | ContactMessage["status"]>("all");

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      message.email
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      message.subject
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      message.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const newCount = messages.filter(
    (m) => m.status === "new"
  ).length;

  function updateStatus(
    id: string,
    status: ContactMessage["status"]
  ) {
    setMessages((current) =>
      current.map((message) =>
        message.id === id
          ? { ...message, status }
          : message
      )
    );

    if (selectedMessage?.id === id) {
      setSelectedMessage({
        ...selectedMessage,
        status,
      });
    }
  }

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">

        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gold" />

            <span className="text-[10px] tracking-[0.3em] uppercase text-gold">
              Le Concierge
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl">
            Contact Messages
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage inquiries and correspondence from your clients.
          </p>
        </div>

        {/* NEW COUNT */}
        <div className="flex items-center gap-3 border border-border px-5 py-3">
          <div className="h-2 w-2 rounded-full bg-gold" />

          <span className="text-sm">
            <strong>{newCount}</strong>{" "}
            new {newCount === 1 ? "message" : "messages"}
          </span>
        </div>
      </div>


      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <div className="border border-border p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Total
          </p>

          <p className="mt-3 font-serif text-3xl">
            {messages.length}
          </p>
        </div>

        <div className="border border-border p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            New
          </p>

          <p className="mt-3 font-serif text-3xl text-gold">
            {newCount}
          </p>
        </div>

        <div className="border border-border p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Replied
          </p>

          <p className="mt-3 font-serif text-3xl">
            {
              messages.filter(
                (m) => m.status === "replied"
              ).length
            }
          </p>
        </div>

        <div className="border border-border p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Archived
          </p>

          <p className="mt-3 font-serif text-3xl">
            {
              messages.filter(
                (m) => m.status === "archived"
              ).length
            }
          </p>
        </div>
      </div>


      {/* TOOLBAR */}
      <div className="border border-border p-4 mb-4">

        <div className="flex flex-col md:flex-row gap-3">

          {/* SEARCH */}
          <div className="relative flex-1">
            <Search
              size={17}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search messages..."
              className="w-full bg-muted/20 border border-border pl-11 pr-4 py-3 text-sm outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* STATUS FILTER */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "all"
                    | ContactMessage["status"]
                )
              }
              className="appearance-none bg-muted/20 border border-border px-4 pr-10 py-3 text-sm outline-none focus:border-gold cursor-pointer"
            >
              <option value="all">
                All Messages
              </option>

              <option value="new">
                New
              </option>

              <option value="read">
                Read
              </option>

              <option value="replied">
                Replied
              </option>

              <option value="archived">
                Archived
              </option>
            </select>

            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>
      </div>


      {/* TABLE */}
      <div className="border border-border overflow-hidden">

        {/* TABLE HEADER */}
        <div className="hidden lg:grid grid-cols-[2fr_2fr_2fr_1fr_1fr_50px] gap-4 px-6 py-4 border-b border-border bg-muted/20">

          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Client
          </span>

          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Email
          </span>

          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Subject
          </span>

          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Status
          </span>

          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Date
          </span>
        </div>


        {/* ROWS */}
        {filteredMessages.length === 0 ? (

          <div className="py-20 text-center">

            <Mail
              size={36}
              strokeWidth={1}
              className="mx-auto text-muted-foreground mb-4"
            />

            <p className="font-serif text-xl">
              No messages found
            </p>

            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filter.
            </p>

          </div>

        ) : (

          filteredMessages.map((message) => (

            <div
              key={message.id}
              className="group border-b last:border-b-0 border-border hover:bg-muted/20 transition-colors"
            >

              <div className="grid lg:grid-cols-[2fr_2fr_2fr_1fr_1fr_50px] gap-4 items-center px-6 py-5">

                {/* CLIENT */}
                <div className="flex items-center gap-3">

                  <div className="h-9 w-9 rounded-full border border-gold/30 flex items-center justify-center text-gold font-serif">
                    {message.name.charAt(0)}
                  </div>

                  <div>
                    <p
                      className={`text-sm ${
                        message.status === "new"
                          ? "font-medium"
                          : ""
                      }`}
                    >
                      {message.name}
                    </p>

                    <p className="lg:hidden text-xs text-muted-foreground mt-1">
                      {message.email}
                    </p>
                  </div>
                </div>


                {/* EMAIL */}
                <p className="hidden lg:block text-sm text-muted-foreground truncate">
                  {message.email}
                </p>


                {/* SUBJECT */}
                <div>
                  <p className="text-sm truncate">
                    {message.subject ||
                      "No subject"}
                  </p>

                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {message.message}
                  </p>
                </div>


                {/* STATUS */}
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 border text-[10px] uppercase tracking-wider ${statusStyles(
                      message.status
                    )}`}
                  >
                    {message.status}
                  </span>
                </div>


                {/* DATE */}
                <p className="hidden lg:block text-xs text-muted-foreground">
                  {formatDate(
                    message.created_at
                  )}
                </p>


                {/* ACTION */}
                <button
                  onClick={() =>
                    setSelectedMessage(message)
                  }
                  className="h-9 w-9 border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                  title="View message"
                >
                  <Eye size={16} />
                </button>

              </div>

            </div>

          ))

        )}

      </div>


      {/* MESSAGE DETAIL MODAL */}
      {selectedMessage && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() =>
              setSelectedMessage(null)
            }
          />

          {/* MODAL */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-background border border-border shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-start justify-between p-6 border-b border-border">

              <div>

                <div className="flex items-center gap-2 mb-3">

                  <Mail
                    size={17}
                    className="text-gold"
                  />

                  <span className="text-[10px] tracking-[0.25em] uppercase text-gold">
                    Correspondence
                  </span>

                </div>

                <h2 className="font-serif text-3xl">
                  {selectedMessage.subject ||
                    "No Subject"}
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedMessage(null)
                }
                className="h-9 w-9 border border-border flex items-center justify-center hover:border-gold hover:text-gold"
              >
                <X size={17} />
              </button>

            </div>


            {/* CLIENT */}
            <div className="p-6 border-b border-border">

              <div className="flex items-center gap-4">

                <div className="h-12 w-12 rounded-full border border-gold/30 flex items-center justify-center text-gold font-serif text-lg">
                  {selectedMessage.name.charAt(0)}
                </div>

                <div>
                  <p className="font-medium">
                    {selectedMessage.name}
                  </p>

                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors"
                  >
                    {selectedMessage.email}
                  </a>
                </div>

              </div>

            </div>


            {/* MESSAGE */}
            <div className="p-6">

              <div className="flex justify-between items-center mb-4">

                <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                  Message
                </span>

                <span className="text-xs text-muted-foreground">
                  {formatDate(
                    selectedMessage.created_at
                  )}
                </span>

              </div>

              <p className="text-sm leading-7 text-foreground/80 whitespace-pre-wrap">
                {selectedMessage.message}
              </p>

            </div>


            {/* ACTIONS */}
            <div className="p-6 border-t border-border bg-muted/10">

              <div className="flex flex-wrap gap-3">

                {selectedMessage.status ===
                  "new" && (
                  <button
                    onClick={() =>
                      updateStatus(
                        selectedMessage.id,
                        "read"
                      )
                    }
                    className="btn-gold flex items-center gap-2"
                  >
                    <Check size={15} />
                    Mark as Read
                  </button>
                )}

                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${
                    selectedMessage.subject ||
                    "Your inquiry"
                  }`}
                  onClick={() =>
                    updateStatus(
                      selectedMessage.id,
                      "replied"
                    )
                  }
                  className="border border-border px-5 py-3 text-sm flex items-center gap-2 hover:border-gold hover:text-gold transition-colors"
                >
                  <Reply size={15} />
                  Reply
                </a>

                <button
                  onClick={() =>
                    updateStatus(
                      selectedMessage.id,
                      "archived"
                    )
                  }
                  className="border border-border px-5 py-3 text-sm flex items-center gap-2 hover:border-gold hover:text-gold transition-colors"
                >
                  <Archive size={15} />
                  Archive
                </button>

                <button
                  onClick={() => {
                    setMessages((current) =>
                      current.filter(
                        (m) =>
                          m.id !==
                          selectedMessage.id
                      )
                    );

                    setSelectedMessage(null);
                  }}
                  className="border border-red-500/20 text-red-500 px-5 py-3 text-sm flex items-center gap-2 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={15} />
                  Delete
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}