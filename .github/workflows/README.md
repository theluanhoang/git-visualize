# CI/CD Deployment Workflow

Workflow này tự động build và deploy ứng dụng lên server khi có push lên branch `main`.

## Cấu hình Secrets

Để workflow hoạt động, bạn cần cấu hình các GitHub Secrets sau trong repository settings:

### Bắt buộc

1. **DEPLOY_HOST**: Địa chỉ IP hoặc domain của server deploy
   - Ví dụ: `192.168.1.100` hoặc `deploy.example.com`

2. **DEPLOY_USER**: Username để SSH vào server
   - Ví dụ: `ubuntu` hoặc `deploy`

3. **DEPLOY_SSH_KEY**: Private SSH key để kết nối server
   - Tạo key pair: `ssh-keygen -t ed25519 -C "github-actions"`
   - Copy private key vào secret
   - Thêm public key vào `~/.ssh/authorized_keys` trên server

4. **DEPLOY_PATH**: Đường dẫn thư mục deploy trên server (optional, mặc định: `/opt/git-visualize-engine`)
   - Ví dụ: `/opt/git-visualize-engine`

5. **BACKEND_ENV_FILE**: Nội dung file `.env.production` cho backend
   - Dán toàn bộ nội dung file `.env.production` (ví dụ: `KEY=value` mỗi dòng)
   - Ví dụ:
     ```
     NODE_ENV=production
     DB_HOST=db
     DB_PORT=5432
     DB_USER=admin
     DB_PASSWORD=super-secret
     JWT_ACCESS_SECRET=...
     JWT_REFRESH_SECRET=...
     GEMINI_API_KEY=...
     ```
   - Workflow sẽ tự động tạo `src/backend/.env.production` từ secret này

### Tùy chọn

6. **DEPLOY_PORT**: Port SSH (optional, mặc định: `22`)
   - Ví dụ: `22` hoặc `2222`

7. **DOCKER_USERNAME**: Username Docker Hub nếu muốn push image (optional)
   - Ví dụ: `yourusername`

8. **DOCKER_PASSWORD**: Password hoặc access token Docker Hub (optional)
   - Tạo access token tại: https://hub.docker.com/settings/security

## Cách thêm Secrets

1. Vào repository trên GitHub
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Thêm từng secret với tên và giá trị tương ứng
5. Workflow sẽ kiểm tra các secret bắt buộc. Nếu thiếu, job dừng ngay với danh sách secret còn thiếu.

## Cấu trúc Workflow

1. **Checkout**: Lấy code từ repository
2. **Validate Secrets**: Kiểm tra các secret bắt buộc (`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `BACKEND_ENV_FILE`)
2. **Build**: Build Docker image với caching tối ưu
3. **Deploy**: 
   - Copy files lên server qua SCP
   - Chạy docker-compose để deploy
   - Health check để đảm bảo services hoạt động
4. **Cleanup**: Dọn dẹp old images

## Lưu ý

- Workflow chỉ chạy khi push lên branch `main`
- Bỏ qua các file markdown, gitignore để tối ưu
- Timeout: 30 phút
- Sử dụng Docker Buildx với GitHub Actions cache để tăng tốc build
- Tự động cleanup old Docker images (>7 days)

## Troubleshooting

### SSH Connection Failed
- Kiểm tra DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY
- Đảm bảo server cho phép SSH từ GitHub Actions IPs
- Test SSH connection: `ssh -i <key> <user>@<host>`

### Docker Build Failed
- Kiểm tra Dockerfile trong `src/backend/Dockerfile`
- Xem logs trong GitHub Actions để debug

### Deployment Failed
- Kiểm tra docker-compose.vercel.yml có đúng format
- Xem logs: `docker-compose -f docker-compose.vercel.yml logs`
- Kiểm tra disk space trên server

### Health Check Failed
- Kiểm tra backend có start thành công
- Xem logs backend: `docker-compose logs backend`
- Kiểm tra port 8000 có accessible

