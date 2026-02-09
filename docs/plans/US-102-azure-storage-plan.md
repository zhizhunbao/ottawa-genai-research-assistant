# 实现计划: US-102 Azure Storage Configuration

**User Story**: US-102
**Sprint**: 1
**Story Points**: 5
**Status**: 待确认

---

## 概述

配置 Azure Blob Storage 作为文档存储，并设置 Azure Key Vault 管理密钥，使后端可以安全地上传和下载 PDF 文件。

---

## 需求重述

- 创建 Azure Blob Storage 账户 (Standard LRS)
- 配置容器访问策略
- 连接字符串存储到 Azure Key Vault
- 后端通过 SDK 访问 Blob Storage
- 支持 PDF 文件上传和下载

---

## 实现阶段

### 阶段 1: Azure 资源创建 (Travis Yi - 4h)

#### 1.1 创建 Azure Key Vault

**操作**: Azure Portal / Azure CLI
**原因**: 先创建 Key Vault，后续服务的密钥都存储于此

```bash
# Azure CLI 命令
az keyvault create \
  --name ottawa-genai-kv \
  --resource-group ottawa-genai-rg \
  --location canadacentral \
  --sku standard
```

**验收**:
- [ ] Key Vault 创建成功
- [ ] 团队成员有访问权限

---

#### 1.2 创建 Azure Blob Storage

**操作**: Azure Portal / Azure CLI

```bash
# 创建存储账户
az storage account create \
  --name ottawagenaistorage \
  --resource-group ottawa-genai-rg \
  --location canadacentral \
  --sku Standard_LRS \
  --kind StorageV2

# 创建容器
az storage container create \
  --name documents \
  --account-name ottawagenaistorage \
  --public-access off
```

**验收**:
- [ ] Storage Account 创建成功
- [ ] `documents` 容器已创建
- [ ] 公共访问已禁用

---

#### 1.3 存储连接字符串到 Key Vault

**操作**: Azure Portal / Azure CLI

```bash
# 获取连接字符串
CONNECTION_STRING=$(az storage account show-connection-string \
  --name ottawagenaistorage \
  --resource-group ottawa-genai-rg \
  --query connectionString -o tsv)

# 存储到 Key Vault
az keyvault secret set \
  --vault-name ottawa-genai-kv \
  --name storage-connection-string \
  --value "$CONNECTION_STRING"
```

**验收**:
- [ ] Secret 已存储到 Key Vault
- [ ] 可通过 Key Vault 读取连接字符串

---

### 阶段 2: 后端配置更新 (Peng Wang - 2h)

#### 2.1 更新 config.py 添加 Azure Storage 配置

**文件**: `backend/app/core/config.py`

```python
# 新增配置项
# Azure Blob Storage
azure_storage_connection_string: str = ""
azure_storage_container_name: str = "documents"

# Azure Key Vault (可选，用于生产环境)
azure_key_vault_url: str = ""
```

**依赖**: 无
**风险**: Low

---

#### 2.2 更新 .env.example

**文件**: `backend/.env.example`

```env
# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
AZURE_STORAGE_CONTAINER_NAME=documents

# Azure Key Vault (Production)
AZURE_KEY_VAULT_URL=https://ottawa-genai-kv.vault.azure.net/
```

**依赖**: 2.1
**风险**: Low

---

### 阶段 3: Blob Storage 服务实现 (Peng Wang - 6h)

#### 3.1 创建 Azure Storage 服务类

**文件**: `backend/app/core/azure_storage.py` (新建)

```python
"""
Azure Blob Storage 服务

提供文件上传、下载、删除功能。
"""

from azure.storage.blob import BlobServiceClient, BlobClient
from azure.core.exceptions import ResourceNotFoundError
from typing import Optional, BinaryIO
import uuid

class AzureBlobStorageService:
    """Azure Blob Storage 操作封装"""

    def __init__(self, connection_string: str, container_name: str):
        self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        self.container_name = container_name
        self.container_client = self.blob_service_client.get_container_client(container_name)

    async def upload_file(
        self,
        file: BinaryIO,
        filename: str,
        content_type: str = "application/pdf"
    ) -> str:
        """上传文件，返回 blob URL"""
        blob_name = f"{uuid.uuid4()}/{filename}"
        blob_client = self.container_client.get_blob_client(blob_name)
        blob_client.upload_blob(file, content_type=content_type, overwrite=True)
        return blob_client.url

    async def download_file(self, blob_name: str) -> Optional[bytes]:
        """下载文件内容"""
        try:
            blob_client = self.container_client.get_blob_client(blob_name)
            return blob_client.download_blob().readall()
        except ResourceNotFoundError:
            return None

    async def delete_file(self, blob_name: str) -> bool:
        """删除文件"""
        try:
            blob_client = self.container_client.get_blob_client(blob_name)
            blob_client.delete_blob()
            return True
        except ResourceNotFoundError:
            return False

    async def get_file_url(self, blob_name: str, expiry_hours: int = 1) -> str:
        """生成带 SAS 的临时访问 URL"""
        # 实现 SAS token 生成
        pass
```

**依赖**: 阶段 2
**风险**: Medium (需要处理网络错误、超时等)

---

#### 3.2 添加依赖到 requirements.txt

**文件**: `backend/requirements.txt`

```
azure-storage-blob>=12.19.0
azure-identity>=1.15.0
```

**依赖**: 无
**风险**: Low

---

#### 3.3 创建依赖注入函数

**文件**: `backend/app/core/dependencies.py` (更新)

```python
from app.core.azure_storage import AzureBlobStorageService
from app.core.config import settings

def get_blob_storage() -> AzureBlobStorageService:
    """获取 Blob Storage 服务实例"""
    return AzureBlobStorageService(
        connection_string=settings.azure_storage_connection_string,
        container_name=settings.azure_storage_container_name
    )
```

**依赖**: 3.1
**风险**: Low

---

### 阶段 4: API 端点更新 (Peng Wang - 4h)

#### 4.1 更新文档上传端点支持文件上传

**文件**: `backend/app/documents/routes.py`

```python
from fastapi import UploadFile, File
from app.core.dependencies import get_blob_storage

@router.post("/upload", response_model=ApiResponse[DocumentResponse])
async def upload_pdf(
    file: UploadFile = File(...),
    service: DocumentService = Depends(get_document_service),
    blob_storage: AzureBlobStorageService = Depends(get_blob_storage)
) -> ApiResponse[DocumentResponse]:
    """上传 PDF 文件到 Azure Blob Storage"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    # 上传到 Blob Storage
    blob_url = await blob_storage.upload_file(
        file=file.file,
        filename=file.filename,
        content_type="application/pdf"
    )

    # 保存文档记录到数据库
    doc_data = DocumentCreate(
        name=file.filename,
        blob_url=blob_url,
        file_type="pdf"
    )
    result = await service.upload(doc_data)
    return ApiResponse.ok(DocumentResponse(**result))
```

**依赖**: 3.3
**风险**: Medium

---

#### 4.2 添加文件下载端点

**文件**: `backend/app/documents/routes.py`

```python
from fastapi.responses import StreamingResponse

@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    service: DocumentService = Depends(get_document_service),
    blob_storage: AzureBlobStorageService = Depends(get_blob_storage)
):
    """下载文档文件"""
    doc = await service.get_by_id(document_id)
    if not doc:
        raise NotFoundError(f"Document {document_id}")

    content = await blob_storage.download_file(doc["blob_name"])
    if not content:
        raise NotFoundError("File not found in storage")

    return StreamingResponse(
        iter([content]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={doc['name']}"}
    )
```

**依赖**: 4.1
**风险**: Low

---

### 阶段 5: 测试 (Hye Ran Yoo - 3h)

#### 5.1 单元测试

**文件**: `backend/tests/core/test_azure_storage.py` (新建)

```python
import pytest
from unittest.mock import Mock, patch
from app.core.azure_storage import AzureBlobStorageService

class TestAzureBlobStorageService:

    @pytest.fixture
    def mock_blob_service(self):
        with patch('app.core.azure_storage.BlobServiceClient') as mock:
            yield mock

    async def test_upload_file_success(self, mock_blob_service):
        """测试文件上传成功"""
        pass

    async def test_download_file_not_found(self, mock_blob_service):
        """测试下载不存在的文件"""
        pass

    async def test_delete_file_success(self, mock_blob_service):
        """测试删除文件"""
        pass
```

**依赖**: 阶段 4
**风险**: Low

---

#### 5.2 集成测试

**文件**: `backend/tests/documents/test_upload.py` (新建)

```python
import pytest
from httpx import AsyncClient
from io import BytesIO

class TestDocumentUpload:

    async def test_upload_pdf_success(self, client: AsyncClient):
        """测试 PDF 上传成功"""
        pass

    async def test_upload_non_pdf_rejected(self, client: AsyncClient):
        """测试非 PDF 文件被拒绝"""
        pass

    async def test_download_document(self, client: AsyncClient):
        """测试文档下载"""
        pass
```

**依赖**: 5.1
**风险**: Low

---

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 修改 | `backend/app/core/config.py` | 添加 Azure Storage 配置 |
| 新建 | `backend/app/core/azure_storage.py` | Blob Storage 服务类 |
| 修改 | `backend/app/core/dependencies.py` | 添加 Blob Storage 依赖 |
| 修改 | `backend/app/documents/routes.py` | 添加上传/下载端点 |
| 修改 | `backend/app/documents/schemas.py` | 添加 blob_url 字段 |
| 修改 | `backend/requirements.txt` | 添加 azure-storage-blob |
| 新建 | `backend/.env.example` | 添加环境变量示例 |
| 新建 | `backend/tests/core/test_azure_storage.py` | 单元测试 |
| 新建 | `backend/tests/documents/test_upload.py` | 集成测试 |

---

## 测试策略

### 单元测试
- Mock BlobServiceClient 测试服务类
- 测试上传、下载、删除操作
- 测试错误处理（文件不存在、网络错误）

### 集成测试
- 使用 Azurite 本地模拟器
- 测试完整上传下载流程
- 测试 API 端点响应

### 手动测试
- Azure Portal 验证 Blob 已上传
- 验证 Key Vault Secret 可访问

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Azure 服务配额不足 | High | 提前申请配额提升 |
| 网络连接问题 | Medium | 实现重试机制 |
| 大文件上传超时 | Medium | 使用分块上传 |
| Key Vault 访问权限 | Medium | 提前配置 RBAC |

---

## 成功标准

- [ ] Azure Blob Storage 账户已创建 (Standard LRS)
- [ ] 容器访问策略已配置 (私有)
- [ ] 连接字符串已存储到 Key Vault
- [ ] 后端可通过 SDK 上传文件
- [ ] 后端可通过 SDK 下载文件
- [ ] 所有测试通过
- [ ] API 文档已更新

---

## 估算复杂度: MEDIUM

| 部分 | 时间估算 |
|------|----------|
| Azure 资源创建 | 4h |
| 后端配置 | 2h |
| 服务实现 | 6h |
| API 端点 | 4h |
| 测试 | 3h |
| **总计** | **19h (~2.5 天)** |

---

**等待确认**: 是否按此计划执行？(yes/no/modify)
