# Charity Events API 接口文档

## 基础信息
- **Base URL**: `http://localhost:3000/api`
- **格式**: JSON
- **认证**: 目前无需认证（后续可加JWT）

---

## 1. 活动相关接口

### 1.1 获取所有活动
**GET** `/events`

**响应示例**:
```json
{
  "success": true,
  "count": 7,
  "data": [
    {
      "id": 1,
      "title": "Gold Coast Half Marathon & Fun Run",
      "description": "Join us for a fun run along the beautiful Gold Coast Broadwater!",
      "event_date": "2026-10-18",
      "start_time": "06:30:00",
      "end_time": "11:00:00",
      "location": "Southport Broadwater Parklands, Gold Coast",
      "price": 45.00,
      "category": "Fun Run",
      "image_url": "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=500",
      "latitude": -27.9677,
      "longitude": 153.4134,
      "organizer_name": "Heart Foundation Australia",
      "is_active": 1,
      "is_custom": 0
    }
  ]
}
```

---

### 1.2 获取单个活动详情
**GET** `/events/:id`

**参数**:
- `id`: 活动ID（数字）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Gold Coast Half Marathon & Fun Run",
    "description": "Join us for a fun run along the beautiful Gold Coast Broadwater!",
    "event_date": "2026-10-18",
    "start_time": "06:30:00",
    "end_time": "11:00:00",
    "location": "Southport Broadwater Parklands, Gold Coast",
    "price": 45.00,
    "category": "Fun Run",
    "image_url": "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=500",
    "latitude": -27.9677,
    "longitude": 153.4134,
    "organizer_name": "Heart Foundation Australia",
    "organizer_email": "info@heartfoundation.org.au",
    "organizer_phone": "(07) 5555 1234",
    "is_active": 1,
    "is_custom": 0,
    "registrations": [
      {
        "id": 1,
        "event_id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "0412 345 678",
        "registration_date": "2026-10-01 10:30:00"
      }
    ],
    "stats": {
      "total_registrations": 1,
      "total_raised": 45.00
    }
  }
}
```

---

### 1.3 创建新活动（管理端用）
**POST** `/events`

**请求体示例**:
```json
{
  "title": "New Charity Gala Dinner",
  "description": "A luxurious evening for a good cause",
  "event_date": "2026-11-15",
  "start_time": "18:30:00",
  "end_time": "23:00:00",
  "location": "Brisbane Convention Centre",
  "price": 150.00,
  "category": "Gala Dinner",
  "image_url": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500",
  "latitude": -27.4698,
  "longitude": 153.0251,
  "organizer_name": "Cancer Council Queensland",
  "organizer_email": "events@cancerqld.org.au",
  "organizer_phone": "(07) 3834 7000"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": 13,
    "title": "New Charity Gala Dinner",
    "...": "..."
  }
}
```

---

### 1.4 更新活动（管理端用）
**PUT** `/events/:id`

**参数**:
- `id`: 活动ID（数字）

**请求体示例**（和创建一样，但只需要传要修改的字段）:
```json
{
  "title": "Updated Gala Dinner Title",
  "price": 160.00
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "id": 13,
    "title": "Updated Gala Dinner Title",
    "...": "..."
  }
}
```

---

### 1.5 删除活动（管理端用）
**DELETE** `/events/:id`

**参数**:
- `id`: 活动ID（数字）

**注意**: 系统自带的活动（is_custom=0）不能删除，会返回403错误。

**响应示例**:
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**错误响应（受保护活动）**:
```json
{
  "success": false,
  "message": "Cannot delete system default events"
}
```

---

## 2. 注册相关接口

### 2.1 创建注册（客户端用）
**POST** `/registrations`

**请求体示例**:
```json
{
  "event_id": 1,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "0498 765 432"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": 11,
    "event_id": 1,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "0498 765 432",
    "registration_date": "2026-10-14 19:30:00"
  }
}
```

---

### 2.2 查看某个活动的注册列表（管理端用）
**GET** `/registrations?event_id=:event_id`

**参数**:
- `event_id`: 活动ID（数字，查询参数）

**响应示例**:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "event_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "0412 345 678",
      "registration_date": "2026-10-01 10:30:00",
      "event_title": "Gold Coast Half Marathon & Fun Run"
    }
  ]
}
```

---

## 3. 天气接口

### 3.1 获取活动地点天气
**GET** `/weather?latitude=:lat&longitude=:lon`

**参数**:
- `latitude`: 纬度（数字）
- `longitude`: 经度（数字）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "temperature": 24.5,
    "weather_code": 0,
    "weather_description": "Clear sky",
    "wind_speed": 12.3
  }
}
```

---

## 4. 错误响应格式

所有错误都返回统一格式：
```json
{
  "success": false,
  "message": "Error message here"
}
```

常见HTTP状态码：
- `200`: 成功
- `400`: 请求参数错误
- `403`: 权限不足（比如删除受保护活动）
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 5. 管理端需要实现的功能列表

1. **登录页面**：简单的管理员登录（可以先写死账号密码）
2. **活动列表页**：显示所有活动，带编辑/删除按钮
3. **创建活动页**：表单创建新活动
4. **编辑活动页**：表单编辑已有活动
5. **注册用户列表页**：查看每个活动的注册用户
6. **数据仪表盘**：显示总活动数、总报名人数、总筹款额
