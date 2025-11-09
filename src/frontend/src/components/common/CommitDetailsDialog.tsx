import React from 'react';
import { X, Calendar, User, GitCommit, Hash, MessageSquare, Copy } from 'lucide-react';
import { ICommit } from '@/types/git';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CommitDetailsDialogProps {
    open: boolean;
    commit: ICommit | null;
    onClose: () => void;
}

const CommitDetailsDialog: React.FC<CommitDetailsDialogProps> = ({ open, commit, onClose }) => {
    const formatDate = (date: Date) => {
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const truncateHash = (hash: string) => {
        return `${hash.substring(0, 7)}...${hash.substring(hash.length - 7)}`;
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <GitCommit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold">Commit Details</DialogTitle>
                            <p className="text-sm text-muted-foreground">Detailed information about this commit</p>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-140px)]">
                    <div className="p-6 space-y-6">
                        {}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Hash className="w-4 h-4" />
                                    Commit Hash
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="break-all">{commit?.id}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(commit?.id || '')}
                                            className="ml-2 h-8 px-2"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Message
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted p-3 rounded-lg">
                                    <p className="text-sm whitespace-pre-wrap">{commit?.message}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Author
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium">Name: </span>
                                        <span className="text-sm">{commit?.author.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium">Email: </span>
                                        <span className="text-sm break-all">{commit?.author.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-sm font-medium">Date: </span>
                                        <span className="text-sm">{commit?.author.date ? formatDate(commit.author.date) : ''}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Committer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium">Name: </span>
                                        <span className="text-sm">{commit?.committer.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium">Email: </span>
                                        <span className="text-sm break-all">{commit?.committer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-sm font-medium">Date: </span>
                                        <span className="text-sm">{commit?.committer.date ? formatDate(commit.committer.date) : ''}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <GitCommit className="w-4 h-4" />
                                    Branch
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge variant="secondary" className="text-sm">
                                    {commit?.branch}
                                </Badge>
                            </CardContent>
                        </Card>

                        {}
                        {commit?.parents && commit.parents.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <GitCommit className="w-4 h-4" />
                                        Parent Commits ({commit.parents.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {commit.parents.map((parentId, index) => (
                                            <div key={parentId} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                                                <span className="font-mono text-sm break-all">{truncateHash(parentId)}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(parentId)}
                                                    className="ml-2 h-8 px-2"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </ScrollArea>

                <div className="flex justify-end p-6 border-t">
                    <Button onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CommitDetailsDialog;
