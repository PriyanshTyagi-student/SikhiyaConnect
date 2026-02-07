'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { mockDiscussions, mockCourses } from '@/lib/mock-data';
import { MessageSquare, ThumbsUp, CheckCircle2, Plus, Search } from 'lucide-react';

function DiscussionsContent() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');

  const [discussions, setDiscussions] = useState(Object.values(mockDiscussions));
  const [selectedDiscussion, setSelectedDiscussion] = useState<any>(null);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    if (selectedId) {
      const discussion = Object.values(mockDiscussions).find(d => d.id === selectedId);
      if (discussion) {
        setSelectedDiscussion(discussion);
      }
    }
  }, [user, isInitialized, router, selectedId]);

  useEffect(() => {
    let filtered = Object.values(mockDiscussions);
    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setDiscussions(filtered);
  }, [searchTerm]);

  if (!isInitialized || !user) {
    return null;
  }

  const handleAddReply = () => {
    if (!newReply.trim() || !selectedDiscussion) return;

    const updatedDiscussion = {
      ...selectedDiscussion,
      replies: [
        ...selectedDiscussion.replies,
        {
          id: `reply-${Date.now()}`,
          authorId: user.id,
          authorName: user.name,
          authorRole: user.role,
          content: newReply,
          createdAt: new Date(),
          likes: 0,
          isUserLiked: false,
        },
      ],
    };

    setSelectedDiscussion(updatedDiscussion);
    setNewReply('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Community Forum</h1>
          <p className="text-foreground/70">Ask questions, share knowledge, and help each other learn</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Discussions List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
                <Input
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {discussions.map((discussion) => (
                <button
                  key={discussion.id}
                  onClick={() => setSelectedDiscussion(discussion)}
                  className={`w-full text-left p-4 rounded-xl transition-colors ${
                    selectedDiscussion?.id === discussion.id
                      ? 'bg-white/70 dark:bg-white/10 ring-1 ring-white/20'
                      : 'bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0 text-foreground/60" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground line-clamp-2">{discussion.title}</h3>
                      <p className="text-xs text-foreground/60 mt-1">
                        {discussion.replies.length} replies
                      </p>
                      {discussion.isResolved && (
                        <div className="flex items-center gap-1 mt-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs text-emerald-500">Resolved</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Discussion Detail */}
          <div className="lg:col-span-2">
            {selectedDiscussion ? (
              <div className="space-y-6">
                {/* Original Post */}
                <Card className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-3xl">
                      {selectedDiscussion.authorRole === 'teacher' ? '👨‍🏫' : '👩‍🎓'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{selectedDiscussion.authorName}</h3>
                        {selectedDiscussion.authorRole === 'teacher' && (
                          <span className="px-2 py-1 bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full font-medium">
                            Teacher
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground/60">
                        {new Date(selectedDiscussion.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedDiscussion.isResolved && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-emerald-100/80 dark:bg-emerald-900/30 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-emerald-600 dark:text-emerald-300 font-medium">Resolved</span>
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-3">{selectedDiscussion.title}</h2>
                  <p className="text-foreground/70 mb-4">{selectedDiscussion.content}</p>

                  <div className="flex gap-4 text-sm text-foreground/60">
                    <span>{selectedDiscussion.views} views</span>
                    <span>{selectedDiscussion.replies.length} replies</span>
                  </div>
                </Card>

                {/* Replies */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">Replies ({selectedDiscussion.replies.length})</h3>

                  {selectedDiscussion.replies.map((reply: any) => (
                    <Card key={reply.id} className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-2xl">
                          {reply.authorRole === 'teacher' ? '👨‍🏫' : '👩‍🎓'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{reply.authorName}</h4>
                            {reply.authorRole === 'teacher' && (
                              <span className="px-2 py-0.5 bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full font-medium">
                                Teacher
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-foreground/60">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <p className="text-foreground/70 mb-3">{reply.content}</p>

                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                        onClick={() => {
                          // Toggle like
                        }}
                      >
                        <ThumbsUp className={`w-4 h-4 ${reply.isUserLiked ? 'fill-current' : ''}`} />
                        <span>{reply.likes}</span>
                      </Button>
                    </Card>
                  ))}
                </div>

                {/* New Reply */}
                <Card className="p-6 border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Your Reply</h3>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Share your thoughts or solution..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      rows={4}
                    />
                    <Button onClick={handleAddReply} disabled={!newReply.trim()}>
                      Post Reply
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-12 border-slate-200 dark:border-slate-800 text-center">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  Select a discussion to view details
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function DiscussionsPage() {
  return (
    <Suspense fallback={<DashboardLayout><div className="text-center py-12">Loading...</div></DashboardLayout>}>
      <DiscussionsContent />
    </Suspense>
  );
}
