import { Lesson } from "@/types/git-theory";

export const lessons: Lesson[] = [
	{
		slug: "git-intro",
		title: "Git Intro",
		description: "Tìm hiểu Git là gì và tại sao nó quan trọng trong phát triển phần mềm.",
		sections: [
			{
				heading: "What is Git?",
				body: `Git là một hệ thống quản lý phiên bản phân tán (Distributed Version Control System) miễn phí và mã nguồn mở.

Git được thiết kế để:
• Xử lý mọi thứ từ dự án nhỏ đến rất lớn với tốc độ và hiệu quả
• Được sử dụng bởi hàng triệu dự án trên toàn thế giới  
• Được phát triển bởi Linus Torvalds vào năm 2005

Git cho phép bạn:
• Theo dõi lịch sử thay đổi của code
• Làm việc nhóm hiệu quả
• Khôi phục code về trạng thái trước đó
• Tạo các nhánh để phát triển tính năng mới
• Hợp nhất code từ nhiều người`,
			},
			{
				heading: "Why Use Git?",
				body: `Git có nhiều lợi ích:

• **Free and Open Source**: Hoàn toàn miễn phí
• **Fast and Small**: Nhanh chóng và hiệu quả
• **Distributed**: Mỗi developer có bản sao đầy đủ
• **Secure**: Sử dụng SHA-1 để đảm bảo tính toàn vẹn
• **Branching**: Hỗ trợ branching và merging mạnh mẽ
• **Popular**: Được sử dụng rộng rãi trong ngành công nghiệp

Git được sử dụng bởi các công ty lớn như Google, Facebook, Microsoft, và nhiều dự án mã nguồn mở.`,
			},
		],
		nextSlug: "git-install",
	},
	{
		slug: "git-install",
		title: "Git Install",
		description: "Hướng dẫn cài đặt Git trên các hệ điều hành khác nhau.",
		sections: [
			{
				heading: "Install Git on Windows",
				body: `Cách cài đặt Git trên Windows:

1. **Download Git for Windows**:
   • Truy cập https://git-scm.com/download/win
   • Tải file cài đặt mới nhất

2. **Run the Installer**:
   • Chạy file .exe đã tải
   • Làm theo hướng dẫn cài đặt
   • Chọn các tùy chọn mặc định

3. **Verify Installation**:
   • Mở Command Prompt hoặc Git Bash
   • Chạy lệnh \`git --version\``,
				examples: [
					{
						id: "git-version-windows",
						title: "Kiểm tra cài đặt Git",
						language: "bash",
						code: "git --version",
						description: "Kiểm tra phiên bản Git đã cài đặt.",
					},
				],
			},
			{
				heading: "Install Git on Mac",
				body: `Cách cài đặt Git trên macOS:

**Option 1: Using Homebrew (Recommended)**:
• Cài đặt Homebrew nếu chưa có
• Chạy: \`brew install git\`

**Option 2: Using Xcode Command Line Tools**:
• Mở Terminal
• Chạy: \`xcode-select --install\`
• Làm theo hướng dẫn

**Option 3: Download from Git Website**:
• Truy cập https://git-scm.com/download/mac
• Tải và cài đặt`,
				examples: [
					{
						id: "git-install-mac",
						title: "Cài đặt Git trên Mac",
						language: "bash",
						code: "# Cài đặt Homebrew (nếu chưa có)\n/bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"\n\n# Cài đặt Git\nbrew install git\n\n# Kiểm tra phiên bản\ngit --version",
						description: "Cài đặt Git trên macOS sử dụng Homebrew.",
					},
				],
			},
			{
				heading: "Install Git on Linux",
				body: `Cách cài đặt Git trên Linux:

**Ubuntu/Debian**:
• \`sudo apt update\`
• \`sudo apt install git\`

**CentOS/RHEL/Fedora**:
• \`sudo yum install git\`
• hoặc \`sudo dnf install git\`

**Arch Linux**:
• \`sudo pacman -S git\``,
				examples: [
					{
						id: "git-install-linux",
						title: "Cài đặt Git trên Linux",
						language: "bash",
						code: "# Ubuntu/Debian\nsudo apt update\nsudo apt install git\n\n# CentOS/RHEL\nsudo yum install git\n\n# Fedora\nsudo dnf install git\n\n# Arch Linux\nsudo pacman -S git\n\n# Kiểm tra cài đặt\ngit --version",
						description: "Cài đặt Git trên các distro Linux khác nhau.",
					},
				],
			},
		],
		prevSlug: "git-intro",
		nextSlug: "git-config",
	},
	{
		slug: "git-config",
		title: "Git Config",
		description: "Cấu hình Git với thông tin cá nhân và các tùy chọn khác.",
		sections: [
			{
				heading: "Configure Git",
				body: `Sau khi cài đặt Git, bạn cần cấu hình thông tin cá nhân:

• **user.name**: Tên của bạn
• **user.email**: Email của bạn (thường là email GitHub/GitLab)

Cấu hình có thể được thiết lập ở 3 cấp độ:
• **System-wide**: Áp dụng cho tất cả users trên máy
• **Global**: Áp dụng cho user hiện tại
• **Local**: Chỉ áp dụng cho repository hiện tại

Thứ tự ưu tiên: Local > Global > System`,
				examples: [
					{
						id: "git-config-setup",
						title: "Cấu hình Git cơ bản",
						language: "bash",
						code: "# Cấu hình global (cho tất cả repositories)\ngit config --global user.name \"Your Name\"\ngit config --global user.email \"your.email@example.com\"\n\n# Xem cấu hình hiện tại\ngit config --list\ngit config user.name\ngit config user.email",
						description: "Thiết lập tên và email cho Git.",
					},
				],
			},
			{
				heading: "Git Config Levels",
				body: `Git có 3 cấp độ cấu hình:

**System Level** (\`--system\`):
• Lưu trong \`/etc/gitconfig\`
• Áp dụng cho tất cả users trên máy
• Cần quyền admin để thay đổi

**Global Level** (\`--global\`):
• Lưu trong \`~/.gitconfig\`
• Áp dụng cho user hiện tại
• Thường được sử dụng nhất

**Local Level** (\`--local\`):
• Lưu trong \`.git/config\` của repository
• Chỉ áp dụng cho repository hiện tại
• Override global và system config`,
				examples: [
					{
						id: "git-config-levels",
						title: "Các cấp độ cấu hình",
						language: "bash",
						code: "# Cấu hình system (cần sudo)\nsudo git config --system user.name \"System User\"\n\n# Cấu hình global\ngit config --global user.name \"Global User\"\n\n# Cấu hình local (trong repository)\ngit config --local user.name \"Local User\"\n\n# Xem cấu hình từng cấp độ\ngit config --system --list\ngit config --global --list\ngit config --local --list",
						description: "Các cấp độ cấu hình khác nhau trong Git.",
					},
				],
			},
		],
		prevSlug: "git-install",
		nextSlug: "git-get-started",
	},
	{
		slug: "git-get-started",
		title: "Git Get Started",
		description: "Bắt đầu sử dụng Git với các lệnh cơ bản đầu tiên.",
		sections: [
			{
				heading: "Create a New Repository",
				body: `Để tạo repository mới:

1. **Create a new directory**:
   • \`mkdir my-project\`
   • \`cd my-project\`

2. **Initialize Git**:
   • \`git init\`

3. **Add files**:
   • Tạo file hoặc copy file vào thư mục
   • \`git add .\`

4. **Make your first commit**:
   • \`git commit -m "Initial commit"\``,
				examples: [
					{
						id: "git-init-project",
						title: "Tạo repository mới",
						language: "bash",
						code: "# Tạo thư mục dự án\nmkdir my-project\ncd my-project\n\n# Khởi tạo Git repository\ngit init\n\n# Tạo file đầu tiên\necho \"# My Project\" > README.md\n\n# Thêm file vào staging area\ngit add README.md\n\n# Tạo commit đầu tiên\ngit commit -m \"Initial commit\"\n\n# Kiểm tra trạng thái\ngit status",
						description: "Tạo repository Git mới từ đầu.",
					},
				],
			},
			{
				heading: "Clone an Existing Repository",
				body: `Để làm việc với repository có sẵn:

1. **Find the repository URL**:
   • GitHub, GitLab, Bitbucket, etc.

2. **Clone the repository**:
   • \`git clone <url>\`

3. **Navigate to the directory**:
   • \`cd <repository-name>\``,
				examples: [
					{
						id: "git-clone-repo",
						title: "Clone repository",
						language: "bash",
						code: "# Clone repository từ GitHub\ngit clone https://github.com/user/repo.git\n\n# Clone vào thư mục tùy chỉnh\ngit clone https://github.com/user/repo.git my-custom-name\n\n# Clone chỉ branch cụ thể\ngit clone -b develop https://github.com/user/repo.git\n\n# Di chuyển vào thư mục\ncd repo\n\n# Kiểm tra trạng thái\ngit status",
						description: "Clone repository từ remote.",
					},
				],
			},
		],
		prevSlug: "git-config",
		nextSlug: "git-new-files",
	},
	{
		slug: "git-new-files",
		title: "Git New Files",
		description: "Thêm file mới vào Git repository và quản lý untracked files.",
		sections: [
			{
				heading: "Adding New Files",
				body: `Khi bạn tạo file mới trong repository, Git sẽ không tự động track chúng.

Để thêm file mới:
1. **Create the file**
2. **Check status**: \`git status\`
3. **Add the file**: \`git add <filename>\`
4. **Commit the file**: \`git commit -m "message"\`

Git có 3 trạng thái cho files:
• **Untracked**: File mới, chưa được Git track
• **Staged**: File đã được add, sẵn sàng commit
• **Committed**: File đã được lưu trong repository`,
				examples: [
					{
						id: "git-add-new-files",
						title: "Thêm file mới",
						language: "bash",
						code: "# Tạo file mới\necho \"Hello World\" > hello.txt\necho \"console.log('Hello');\" > script.js\n\n# Kiểm tra trạng thái\ngit status\n\n# Thêm file cụ thể\ngit add hello.txt\n\n# Thêm tất cả file mới\ngit add .\n\n# Kiểm tra trạng thái sau khi add\ngit status\n\n# Commit các file\ngit commit -m \"Add new files\"",
						description: "Thêm file mới vào Git repository.",
					},
				],
			},
			{
				heading: "Git Status",
				body: `\`git status\` cho biết trạng thái hiện tại của repository:

• **Untracked files**: File mới chưa được add
• **Changes to be committed**: File đã staged, sẵn sàng commit
• **Changes not staged for commit**: File đã modified nhưng chưa staged
• **Clean working tree**: Không có thay đổi nào

Các trạng thái file:
• **Red text**: Untracked hoặc modified files
• **Green text**: Staged files`,
				examples: [
					{
						id: "git-status-examples",
						title: "Kiểm tra trạng thái",
						language: "bash",
						code: "# Kiểm tra trạng thái cơ bản\ngit status\n\n# Kiểm tra trạng thái ngắn gọn\ngit status -s\n\n# Kiểm tra trạng thái với thông tin chi tiết\ngit status --porcelain\n\n# Tạo thay đổi để test\necho \"New content\" >> hello.txt\ngit status",
						description: "Sử dụng git status để kiểm tra trạng thái repository.",
					},
				],
			},
		],
		prevSlug: "git-get-started",
		nextSlug: "git-staging",
	},
	{
		slug: "git-staging",
		title: "Git Staging",
		description: "Hiểu về staging area và cách sử dụng git add để chuẩn bị commit.",
		sections: [
			{
				heading: "What is Staging?",
				body: `Staging area (index) là nơi chuẩn bị các thay đổi trước khi commit.

Git có 3 khu vực chính:
• **Working Directory**: Nơi bạn làm việc với files
• **Staging Area**: Nơi chuẩn bị thay đổi cho commit
• **Repository**: Nơi lưu trữ các commit

Quy trình làm việc:
1. **Modify** files trong working directory
2. **Stage** files với \`git add\`
3. **Commit** files với \`git commit\``,
				examples: [
					{
						id: "git-staging-basics",
						title: "Staging files",
						language: "bash",
						code: "# Tạo và chỉnh sửa file\necho \"Line 1\" > file.txt\necho \"Line 2\" >> file.txt\n\n# Kiểm tra trạng thái\ngit status\n\n# Stage file\ngit add file.txt\n\n# Kiểm tra trạng thái sau staging\ngit status\n\n# Xem thay đổi đã staged\ngit diff --cached",
						description: "Staging files với git add.",
					},
				],
			},
			{
				heading: "Git Add Options",
				body: `Các cách sử dụng \`git add\`:

• \`git add <file>\` - Thêm file cụ thể
• \`git add .\` - Thêm tất cả file trong thư mục hiện tại
• \`git add -A\` - Thêm tất cả file trong repository
• \`git add -u\` - Thêm tất cả file đã tracked
• \`git add -p\` - Thêm từng phần của file (interactive)`,
				examples: [
					{
						id: "git-add-options",
						title: "Các tùy chọn git add",
						language: "bash",
						code: "# Thêm file cụ thể\ngit add file1.txt file2.txt\n\n# Thêm tất cả file trong thư mục hiện tại\ngit add .\n\n# Thêm tất cả file trong repository\ngit add -A\n\n# Thêm tất cả file đã tracked\ngit add -u\n\n# Interactive add (từng phần)\ngit add -p file.txt\n\n# Thêm file theo pattern\ngit add *.js\ngit add src/",
						description: "Các cách khác nhau để sử dụng git add.",
					},
				],
			},
		],
		prevSlug: "git-new-files",
		nextSlug: "git-commit",
	},
	{
		slug: "git-commit",
		title: "Git Commit",
		description: "Tạo commit để lưu trữ snapshot của các thay đổi đã staged.",
		sections: [
			{
				heading: "What is a Commit?",
				body: `A **commit** is like a save point in your project.

It records a snapshot of your files at a certain time, with a message describing what changed.

You can always go back to a previous commit if you need to.

Here are some key commands for commits:
• \`git commit -m "message"\` - Commit staged changes with a message
• \`git commit -a -m "message"\` - Commit all tracked changes (skip staging)
• \`git log\` - See commit history`,
				examples: [
					{
						id: "git-commit-basic",
						title: "Tạo commit cơ bản",
						language: "bash",
						code: "# Stage files\ngit add file.txt\n\n# Commit với message\ngit commit -m \"Add new file\"\n\n# Xem lịch sử commit\ngit log --oneline\n\n# Xem chi tiết commit\ngit show",
						description: "Tạo commit cơ bản với message.",
					},
				],
			},
			{
				heading: "Commit All Changes Without Staging (-a)",
				body: `You can skip the staging step for **already tracked files** with \`git commit -a -m "message"\`.

This commits all modified and deleted files, **but not new/untracked files**.

**Warning:** Skipping the staging step can make you include unwanted changes. Use with care.

**Note:** \`git commit -a\` does not work for new/untracked files. You must use \`git add <file>\` first for new files.`,
				examples: [
					{
						id: "git-commit-a",
						title: "Commit tất cả thay đổi",
						language: "bash",
						code: "# Chỉnh sửa file đã tracked\necho \"New content\" >> existing-file.txt\n\n# Commit tất cả thay đổi (skip staging)\ngit commit -a -m \"Update existing file\"\n\n# Không hoạt động với file mới\necho \"New file\" > new-file.txt\ngit commit -a -m \"This won't work for new files\"\n\n# Cần add file mới trước\ngit add new-file.txt\ngit commit -m \"Add new file\"",
						description: "Sử dụng git commit -a để skip staging.",
					},
				],
			},
			{
				heading: "Write Multi-line Commit Messages",
				body: `If you just type \`git commit\` (no \`-m\`), your default editor will open so you can write a detailed, multi-line message:

Write a short summary on the first line, leave a blank line, then add more details below.

**Commit Message Best Practices:**
• Keep the first line short (50 characters or less)
• Use the imperative mood (e.g., "Add feature" not "Added feature")
• Leave a blank line after the summary, then add more details if needed
• Describe _why_ the change was made, not just what changed`,
				examples: [
					{
						id: "git-commit-multiline",
						title: "Commit message nhiều dòng",
						language: "bash",
						code: "# Commit với editor (không có -m)\ngit commit\n\n# Trong editor, viết:\n# Add user authentication feature\n#\n# - Implement login functionality\n# - Add password validation\n# - Create user session management\n#\n# Fixes issue #123\n\n# Commit với nhiều -m\ngit commit -m \"Add user authentication\" -m \"- Implement login functionality\" -m \"- Add password validation\"",
						description: "Tạo commit message chi tiết.",
					},
				],
			},
			{
				heading: "View Commit History (git log)",
				body: `To view the history of commits for a repository, you can use the \`git log\` command:

For a shorter view, use \`git log --oneline\`:

To see which files changed in each commit, use \`git log --stat\`:`,
				examples: [
					{
						id: "git-log-examples",
						title: "Xem lịch sử commit",
						language: "bash",
						code: "# Xem lịch sử đầy đủ\ngit log\n\n# Xem lịch sử ngắn gọn\ngit log --oneline\n\n# Xem lịch sử với thống kê file\ngit log --stat\n\n# Xem lịch sử với graph\ngit log --oneline --graph\n\n# Xem lịch sử của file cụ thể\ngit log -- file.txt\n\n# Xem lịch sử với giới hạn số lượng\ngit log -5 --oneline",
						description: "Các cách xem lịch sử commit.",
					},
				],
			},
		],
		prevSlug: "git-staging",
		nextSlug: "git-tagging",
	},
	{
		slug: "git-tagging",
		title: "Git Tagging",
		description: "Sử dụng tags để đánh dấu các điểm quan trọng trong lịch sử commit.",
		sections: [
			{
				heading: "What are Tags?",
				body: `Tags là cách đánh dấu các điểm quan trọng trong lịch sử Git.

Thường được sử dụng để:
• Đánh dấu release versions (v1.0, v2.0)
• Đánh dấu milestones quan trọng
• Tạo reference dễ nhớ cho commit

Có 2 loại tags:
• **Lightweight tags**: Chỉ là pointer đến commit
• **Annotated tags**: Chứa thông tin metadata`,
				examples: [
					{
						id: "git-tag-basics",
						title: "Tạo và quản lý tags",
						language: "bash",
						code: "# Tạo lightweight tag\ngit tag v1.0\n\n# Tạo annotated tag\ngit tag -a v1.1 -m \"Release version 1.1\"\n\n# Xem tất cả tags\ngit tag\n\n# Xem chi tiết tag\ngit show v1.1\n\n# Xóa tag\ngit tag -d v1.0",
						description: "Tạo và quản lý Git tags.",
					},
				],
			},
			{
				heading: "Git Tag Commands",
				body: `Các lệnh Git tag cơ bản:

• \`git tag <tagname>\` - Create a lightweight tag
• \`git tag -a <tagname> -m "message"\` - Create an annotated tag
• \`git tag <tagname> <commit-hash>\` - Tag a specific commit
• \`git tag\` - List tags
• \`git show <tagname>\` - Show tag details`,
				examples: [
					{
						id: "git-tag-commands",
						title: "Các lệnh Git tag",
						language: "bash",
						code: "# Tạo lightweight tag\ngit tag v1.0\n\n# Tạo annotated tag\ngit tag -a v1.1 -m \"Release version 1.1\"\n\n# Tag commit cụ thể\ngit tag v1.0 abc1234\n\n# Xem tất cả tags\ngit tag\n\n# Xem chi tiết tag\ngit show v1.1",
						description: "Các lệnh Git tag cơ bản.",
					},
				],
			},
			{
				heading: "Tag Troubleshooting",
				body: `**Tag already exists?**
• **Problem:** A tag you're trying to create already exists.
• **Solution:** Use \`git tag -d <tagname>\` to delete it, then re-create.

**Pushed the wrong tag?**
• **Problem:** You've pushed an incorrect tag to the remote repository.
• **Solution:** Delete it locally and remotely, then push the correct tag.

**Tag not showing on remote?**
• **Problem:** A tag you've created locally isn't visible on the remote repository.
• **Solution:** Remember to push tags with \`git push origin <tagname>\` or \`git push --tags\`.

**Need to overwrite a tag on the remote?**
• **Problem:** You need to replace an existing tag on the remote with a new version.
• **Solution:** You can force-push a tag with \`git push --force origin <tagname>\`, but be careful! This will overwrite the tag for everyone using the remote.`,
				examples: [
					{
						id: "git-tag-troubleshooting",
						title: "Xử lý lỗi với tags",
						language: "bash",
						code: "# Xóa tag local\ngit tag -d v1.0\n\n# Push tag lên remote\ngit push origin v1.0\n\n# Push tất cả tags\ngit push --tags\n\n# Force push tag (cẩn thận!)\ngit push --force origin v1.0\n\n# Xóa tag trên remote\ngit push origin --delete v1.0",
						description: "Các lệnh xử lý lỗi với Git tags.",
					},
				],
			},
		],
		prevSlug: "git-commit",
		nextSlug: "git-stash",
	},
	{
		slug: "git-stash",
		title: "Git Stash",
		description: "Lưu trữ tạm thời các thay đổi chưa commit để chuyển đổi branch.",
		sections: [
			{
				heading: "What is Git Stash?",
				body: `Git stash lưu trữ tạm thời các thay đổi chưa commit.

Stash hữu ích khi:
• Cần chuyển branch nhưng chưa muốn commit
• Cần pull code mới từ remote
• Muốn thử nghiệm mà không mất thay đổi hiện tại

Các lệnh stash cơ bản:
• \`git stash\` - Lưu thay đổi hiện tại
• \`git stash list\` - Xem danh sách stash
• \`git stash pop\` - Áp dụng và xóa stash gần nhất
• \`git stash apply\` - Áp dụng stash nhưng giữ lại`,
				examples: [
					{
						id: "git-stash-basics",
						title: "Sử dụng git stash",
						language: "bash",
						code: "# Đang làm việc trên file\necho \"Work in progress\" >> file.txt\ngit status\n\n# Lưu thay đổi tạm thời\ngit stash\n\n# Chuyển branch để làm việc khác\ngit checkout main\ngit pull origin main\n\n# Quay lại branch và khôi phục\ngit checkout feature-branch\ngit stash pop\n\n# Xem danh sách stash\ngit stash list",
						description: "Sử dụng stash để lưu trữ tạm thời thay đổi.",
					},
				],
			},
		],
		prevSlug: "git-tagging",
		nextSlug: "git-history",
	},
	{
		slug: "git-history",
		title: "Git History",
		description: "Khám phá lịch sử commit và các cách xem thông tin chi tiết.",
		sections: [
			{
				heading: "Viewing Git History",
				body: `Git cung cấp nhiều cách để xem lịch sử:

• \`git log\` - Xem lịch sử đầy đủ
• \`git log --oneline\` - Xem lịch sử ngắn gọn
• \`git log --graph\` - Xem lịch sử với graph
• \`git log --stat\` - Xem thống kê file thay đổi
• \`git show\` - Xem chi tiết commit cụ thể`,
				examples: [
					{
						id: "git-history-commands",
						title: "Xem lịch sử Git",
						language: "bash",
						code: "# Xem lịch sử đầy đủ\ngit log\n\n# Xem lịch sử ngắn gọn\ngit log --oneline\n\n# Xem lịch sử với graph\ngit log --oneline --graph\n\n# Xem lịch sử với thống kê\ngit log --stat\n\n# Xem chi tiết commit gần nhất\ngit show\n\n# Xem chi tiết commit cụ thể\ngit show abc1234",
						description: "Các lệnh xem lịch sử Git.",
					},
				],
			},
		],
		prevSlug: "git-stash",
		nextSlug: "git-help",
	},
	{
		slug: "git-help",
		title: "Git Help",
		description: "Sử dụng hệ thống trợ giúp của Git để tìm hiểu các lệnh.",
		sections: [
			{
				heading: "Getting Help",
				body: `Git có hệ thống trợ giúp tích hợp:

• \`git help\` - Hiển thị danh sách lệnh Git
• \`git help <command>\` - Trợ giúp cho lệnh cụ thể
• \`git <command> --help\` - Tương tự git help
• \`git <command> -h\` - Trợ giúp ngắn gọn

Bạn cũng có thể:
• Truy cập https://git-scm.com/docs
• Sử dụng man pages: \`man git-<command>\``,
				examples: [
					{
						id: "git-help-commands",
						title: "Sử dụng Git help",
						language: "bash",
						code: "# Xem danh sách lệnh Git\ngit help\n\n# Trợ giúp cho lệnh cụ thể\ngit help commit\ngit help add\ngit help status\n\n# Trợ giúp ngắn gọn\ngit commit -h\ngit add -h\n\n# Mở trợ giúp trong browser\ngit help --web commit",
						description: "Sử dụng hệ thống trợ giúp của Git.",
					},
				],
			},
		],
		prevSlug: "git-history",
		nextSlug: "git-branch",
	},
	{
		slug: "git-branch",
		title: "Git Branch",
		description: "Tạo và quản lý các nhánh để phát triển tính năng song song.",
		sections: [
			{
				heading: "What are Branches?",
				body: `Branch là một pointer di chuyển được trỏ đến một commit cụ thể.

Khi tạo branch mới:
• Git tạo pointer mới
• HEAD chuyển sang branch mới
• Working directory được cập nhật

Branch cho phép:
• Phát triển tính năng độc lập
• Thử nghiệm mà không ảnh hưởng main
• Làm việc song song với team
• Dễ dàng chuyển đổi giữa các phiên bản

Branch mặc định thường là main hoặc master.`,
				examples: [
					{
						id: "git-branch-basics",
						title: "Tạo và quản lý branch",
						language: "bash",
						code: "# Xem tất cả branch\ngit branch\n\n# Tạo branch mới\ngit branch feature-login\n\n# Chuyển sang branch mới\ngit checkout feature-login\n\n# Hoặc tạo và chuyển cùng lúc\ngit checkout -b feature-register\n\n# Xem branch hiện tại\ngit branch\n\n# Chuyển về main\ngit checkout main",
						description: "Tạo, chuyển đổi và quản lý branch.",
					},
				],
			},
		],
		prevSlug: "git-help",
		nextSlug: "git-merge",
	},
	{
		slug: "git-merge",
		title: "Git Merge",
		description: "Kết hợp thay đổi từ các branch khác nhau.",
		sections: [
			{
				heading: "What is Merging?",
				body: `\`git merge\` kết hợp thay đổi từ branch khác vào branch hiện tại.

Có 2 loại merge:
• **Fast-forward merge**: Khi không có conflict
• **Three-way merge**: Khi có conflict cần resolve

Quy trình merge:
1. Chuyển về branch đích (thường là main)
2. \`git merge <source-branch>\`
3. Resolve conflict nếu có
4. Commit merge nếu cần`,
				examples: [
					{
						id: "git-merge-basics",
						title: "Merge branch",
						language: "bash",
						code: "# Chuyển về main\ngit checkout main\n\n# Merge branch feature vào main\ngit merge feature-login\n\n# Xem lịch sử sau merge\ngit log --oneline --graph\n\n# Xóa branch đã merge\ngit branch -d feature-login\n\n# Xem tất cả branch\ngit branch",
						description: "Merge branch và dọn dẹp.",
					},
				],
			},
		],
		prevSlug: "git-branch",
		nextSlug: "git-workflow",
	},
	{
		slug: "git-workflow",
		title: "Git Workflow",
		description: "Các quy trình làm việc phổ biến với Git trong team development.",
		sections: [
			{
				heading: "Common Git Workflows",
				body: `Các quy trình làm việc phổ biến:

**Git Flow**:
• main: Production code
• develop: Integration branch
• feature/*: Feature branches
• release/*: Release preparation
• hotfix/*: Emergency fixes

**GitHub Flow**:
• main: Always deployable
• feature/*: Feature branches
• Pull requests for code review

**GitLab Flow**:
• Similar to GitHub Flow
• Environment branches (staging, production)`,
				examples: [
					{
						id: "git-workflow-example",
						title: "GitHub Flow example",
						language: "bash",
						code: "# Tạo feature branch từ main\ngit checkout main\ngit pull origin main\ngit checkout -b feature/user-authentication\n\n# Làm việc trên feature\necho \"Auth code\" > auth.js\ngit add auth.js\ngit commit -m \"Add user authentication\"\n\n# Push feature branch\ngit push -u origin feature/user-authentication\n\n# Tạo Pull Request trên GitHub\n# Sau khi merge, xóa local branch\ngit checkout main\ngit pull origin main\ngit branch -d feature/user-authentication",
						description: "Ví dụ quy trình GitHub Flow.",
					},
				],
			},
		],
		prevSlug: "git-merge",
		nextSlug: "git-best-practices",
	},
	{
		slug: "git-best-practices",
		title: "Git Best Practices",
		description: "Các thực hành tốt nhất khi sử dụng Git trong dự án thực tế.",
		sections: [
			{
				heading: "Commit Best Practices",
				body: `**Commit Message Guidelines:**
• Use imperative mood: "Add feature" not "Added feature"
• Keep first line under 50 characters
• Capitalize the first letter
• No period at the end of the first line
• Use body to explain what and why

**Commit Frequency:**
• Commit often, push regularly
• One logical change per commit
• Don't commit broken code
• Test before committing`,
				examples: [
					{
						id: "commit-best-practices",
						title: "Good commit messages",
						language: "bash",
						code: "# Good commit messages\ngit commit -m \"Add user login functionality\"\ngit commit -m \"Fix memory leak in data processing\"\ngit commit -m \"Update documentation for API changes\"\n\n# Bad commit messages\ngit commit -m \"fix\"\ngit commit -m \"updated stuff\"\ngit commit -m \"WIP\"\n\n# Good multi-line commit\ngit commit -m \"Refactor authentication system\" -m \"- Extract login logic into separate service\" -m \"- Add input validation\" -m \"- Improve error handling\"",
						description: "Ví dụ về commit messages tốt và xấu.",
					},
				],
			},
			{
				heading: "Branch Best Practices",
				body: `**Branch Naming:**
• Use descriptive names
• Include type prefix: feature/, bugfix/, hotfix/
• Use kebab-case: feature/user-authentication

**Branch Management:**
• Keep branches short-lived
• Delete merged branches
• Regularly sync with main
• Use pull requests for code review`,
				examples: [
					{
						id: "branch-best-practices",
						title: "Branch naming examples",
						language: "bash",
						code: "# Good branch names\ngit checkout -b feature/user-authentication\ngit checkout -b bugfix/login-validation\ngit checkout -b hotfix/security-patch\ngit checkout -b chore/update-dependencies\n\n# Bad branch names\ngit checkout -b new-feature\ngit checkout -b fix\ngit checkout -b test\n\n# Clean up merged branches\ngit branch --merged | grep -v main | xargs -n 1 git branch -d",
						description: "Ví dụ về tên branch tốt và xấu.",
					},
				],
			},
		],
		prevSlug: "git-workflow",
		nextSlug: "git-glossary",
	},
	{
		slug: "git-glossary",
		title: "Git Glossary",
		description: "Thuật ngữ và khái niệm quan trọng trong Git.",
		sections: [
			{
				heading: "Git Terminology",
				body: `**Repository (Repo):** Nơi lưu trữ toàn bộ lịch sử và metadata của dự án.

**Working Directory:** Thư mục hiện tại nơi bạn đang làm việc với các file.

**Staging Area (Index):** Nơi chuẩn bị các thay đổi trước khi commit.

**Commit:** Snapshot của các file tại một thời điểm cụ thể.

**Branch:** Pointer di chuyển được trỏ đến một commit.

**HEAD:** Pointer trỏ đến commit hiện tại.

**Remote:** Repository được lưu trữ trên server khác.

**Clone:** Tạo bản sao local của remote repository.

**Fork:** Tạo bản sao của repository trên platform khác.

**Pull Request:** Yêu cầu merge thay đổi vào repository chính.`,
			},
		],
		prevSlug: "git-best-practices",
	},
];

export function getLessonBySlug(slug: string): Lesson | undefined {
	return lessons.find((l) => l.slug === slug);
}

export function getLessonMetas(): { slug: string; title: string; description: string }[] {
	return lessons.map(({ slug, title, description }) => ({ slug, title, description }));
}
