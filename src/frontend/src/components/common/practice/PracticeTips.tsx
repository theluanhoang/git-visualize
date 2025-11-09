'use client';

import { motion } from 'framer-motion';

export default function PracticeTips() {
  return (
    <motion.section 
      className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <h3 className="text-lg font-semibold text-foreground mb-3">💡 Mẹo thực hành</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground">
        <div>
          <h4 className="font-medium text-foreground mb-1">Bắt đầu với:</h4>
          <ul className="space-y-1">
            <li>• <code className="bg-muted px-1 rounded">git init</code> - Khởi tạo repository</li>
            <li>• <code className="bg-muted px-1 rounded">git add .</code> - Thêm tất cả file</li>
            <li>• <code className="bg-muted px-1 rounded">git commit -m "message"</code> - Tạo commit</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-foreground mb-1">Thử nghiệm:</h4>
          <ul className="space-y-1">
            <li>• <code className="bg-muted px-1 rounded">git branch feature</code> - Tạo nhánh mới</li>
            <li>• <code className="bg-muted px-1 rounded">git merge feature</code> - Hợp nhất nhánh</li>
            <li>• <code className="bg-muted px-1 rounded">git log --oneline</code> - Xem lịch sử</li>
          </ul>
        </div>
      </div>
    </motion.section>
  );
}
