"""Debug: test folder creation to find 500 error."""
import asyncio
import traceback

from app.core.database import async_session_maker, init_db
from app.core.document_store import DocumentStore
from app.core.enums import DocumentStatus, DocumentType


async def main():
    await init_db()

    async with async_session_maker() as session:
        try:
            store = DocumentStore(session)
            result = await store.create(
                doc_type=DocumentType.FOLDER,
                data={"name": "Test Debug", "parent_id": None},
                owner_id=None,
                status=DocumentStatus.ACTIVE,
            )
            await session.commit()
            print(f"SUCCESS: {result}")
        except Exception as e:
            await session.rollback()
            print(f"ERROR: {e}")
            traceback.print_exc()


asyncio.run(main())
