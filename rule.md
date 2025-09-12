- event_membership
    - id
    - event_id
    - user_id
    - role_id
    - joined_at
- permission_event (quyền truy cập)
    - id
    - display_name (Quét vé, Xem đơn hàng, Xem báo cáo check-in, Gửi email khách hàng, Quản lý thành viên, Xuất báo cáo
      đơn
      hàng, Quản lý sơ đồ ghế, ...)
    - code
- event_role (vai trò trong sự kiện)
    - id
    - code
    - display_name (Quản trị viên, quản lý, nhân viên)
- event_role_permission
    - id
    - event_role_id
    - permission_id
- danh sách endpoint

1. Event Membership (event_membership)

Quản lý thành viên tham gia sự kiện

GET /events/:eventId/members → Lấy danh sách thành viên trong sự kiện

GET /events/:eventId/members/:memberId → Lấy chi tiết 1 thành viên

POST /events/:eventId/members → Thêm thành viên vào sự kiện (có role)

PUT /events/:eventId/members/:memberId → Cập nhật vai trò của thành viên

DELETE /events/:eventId/members/:memberId → Xóa thành viên khỏi sự kiện

2. Permission Event (permission_event)

Quản lý quyền hạn trong sự kiện

GET /permissions → Lấy tất cả quyền có sẵn (dùng để gán vào vai trò)

GET /permissions/:id → Lấy chi tiết quyền

POST /permissions → Thêm quyền mới (nếu hệ thống cho phép)

PUT /permissions/:id → Sửa thông tin quyền

DELETE /permissions/:id → Xóa quyền

3. Event Role (event_role)

Quản lý vai trò trong sự kiện

GET /events/:eventId/roles → Lấy danh sách vai trò trong sự kiện

GET /events/:eventId/roles/:roleId → Lấy chi tiết vai trò

POST /events/:eventId/roles → Thêm vai trò mới

PUT /events/:eventId/roles/:roleId → Cập nhật vai trò

DELETE /events/:eventId/roles/:roleId → Xóa vai trò

4. Event Role Permission (event_role_permission)

Gán quyền cho vai trò

GET /events/:eventId/roles/:roleId/permissions → Lấy quyền của 1 vai trò

POST /events/:eventId/roles/:roleId/permissions → Gán quyền cho vai trò (nhiều quyền một lúc)

DELETE /events/:eventId/roles/:roleId/permissions/:permissionId → Xóa quyền khỏi vai trò

5. Use case quan trọng cần hỗ trợ

Ngoài CRUD, nên có thêm endpoint tiện ích để xử lý nghiệp vụ thực tế:

GET /events/:eventId/members/:userId/permissions
→ Trả về tất cả quyền mà 1 thành viên có (kết hợp role → permissions).

POST /events/:eventId/members/invite
→ Gửi lời mời tham gia sự kiện qua email.

POST /events/:eventId/members/:userId/change-role
→ Đổi vai trò thành viên nhanh.




---------

- list danh sách các role
- list danh sách tất cả permission
- list danh sách các permission đang có trong role
- hiển thị dạng checkbox

-------

- quản lý
- quản trị viên
- nhân viên
- chủ sự kiện

- -----------
**-- phân quyền cho user**

- kiểm tra danh sách các route (route_code, path, method, display_name) -> oke
- insert vào bảng permissions -> oke
- viết seed cho roles -> oke
- viết api cho permission -> get all,
- viết api gán permission vào role -> oke
- viết guard kiểm tra permission trong route
**-- phân quyền cho user trong sự kiện**
- viết api CRUD cho bảng event_roles
- viết api gán permission vào event_role
- viết api gán event_role vào user trong sự kiện
- viết api lấy danh sách permission của user trong sự kiện
- viết guard kiểm tra permission trong route có kèm event_id