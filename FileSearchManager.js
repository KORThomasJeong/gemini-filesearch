const { GoogleGenAI } = require('@google/genai');

/**
 * Gemini API의 File Search 기능을 쉽게 사용할 수 있도록 추상화한 클래스
 */
class FileSearchManager {
  /**
   * @param {string} apiKey - Google Gemini API 키
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API 키가 필요합니다');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * 새로운 File Search Store 생성
   * @param {string} displayName - 스토어 이름
   * @returns {Promise<Object>} 생성된 스토어 정보
   */
  async createStore(displayName) {
    const store = await this.ai.fileSearchStores.create({
      config: { displayName }
    });
    return store;
  }

  /**
   * 모든 File Search Store 목록 조회
   * @param {number} pageSize - 페이지당 항목 수 (기본값: 20)
   * @returns {Promise<Array>} 스토어 목록
   */
  async listStores(pageSize = 20) {
    const stores = await this.ai.fileSearchStores.list({
      config: { pageSize }
    });
    const storeList = [];
    for await (const store of stores) {
      storeList.push(store);
    }
    return storeList;
  }

  /**
   * 특정 스토어 삭제
   * @param {string} storeName - 삭제할 스토어 이름 (예: 'fileSearchStores/xxx')
   * @param {boolean} force - 비어있지 않은 스토어도 강제 삭제 (기본값: true)
   */
  async deleteStore(storeName, force = true) {
    await this.ai.fileSearchStores.delete({
      name: storeName,
      config: { force }
    });
  }

  /**
   * 스토어에 파일 업로드
   * @param {string} filePath - 업로드할 파일 경로
   * @param {string} storeName - 스토어 이름 (예: 'fileSearchStores/xxx')
   * @param {Object} options - 업로드 옵션
   * @param {string} options.mimeType - 파일의 MIME 타입 (예: 'application/x-hwp')
   * @param {number} options.pollInterval - 업로드 완료 체크 간격 (밀리초, 기본값: 5000)
   * @returns {Promise<Object>} 완료된 작업 정보
   */
  async uploadFile(filePath, storeName, options = {}) {
    const { mimeType, displayName, pollInterval = 5000 } = options;

    const uploadParams = {
      file: filePath,
      fileSearchStoreName: storeName,
    };

    // MIME 타입이나 Display Name이 지정된 경우 config에 추가
    if (mimeType || displayName) {
      uploadParams.config = {};
      if (mimeType) uploadParams.config.mimeType = mimeType;
      if (displayName) uploadParams.config.displayName = displayName;
    }

    let operation = await this.ai.fileSearchStores.uploadToFileSearchStore(uploadParams);

    // 업로드 완료까지 대기
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      operation = await this.ai.operations.get({ operation });
    }

    return operation;
  }

  /**
   * 스토어 내 문서 목록 조회
   * @param {string} storeName - 스토어 이름 (예: 'fileSearchStores/xxx')
   * @returns {Promise<Array>} 문서 목록
   */
  async listDocuments(storeName) {
    const documents = await this.ai.fileSearchStores.documents.list({
      parent: storeName
    });
    const docList = [];
    for await (const doc of documents) {
      docList.push(doc);
    }
    return docList;
  }

  /**
   * 스토어에서 문서 삭제
   * @param {string} documentName - 삭제할 문서 이름 (예: 'fileSearchStores/xxx/documents/yyy')
   * @param {boolean} force - 강제 삭제 여부 (기본값: true)
   */
  async deleteDocument(documentName, force = true) {
    await this.ai.fileSearchStores.documents.delete({
      name: documentName,
      config: { force }
    });
  }

  /**
   * File Search를 사용하여 질문에 답변
   * @param {string} query - 질문 내용
   * @param {string|Array<string>} storeNames - 검색할 스토어 이름(들)
   * @param {string} model - 사용할 모델 (기본값: 'gemini-2.5-flash')
   * @returns {Promise<string>} 답변 텍스트
   */
  async search(query, storeNames, model = 'gemini-2.5-flash') {
    // storeNames를 배열로 정규화
    const storeNameArray = Array.isArray(storeNames) ? storeNames : [storeNames];

    const response = await this.ai.models.generateContent({
      model,
      contents: query,
      config: {
        tools: [{
          fileSearch: {
            fileSearchStoreNames: storeNameArray
          }
        }]
      }
    });

    return {
      text: response.text,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  }

  /**
   * 스토어 정보 조회 (디버깅용)
   * @param {string} storeName - 스토어 이름
   * @returns {Promise<Object>} 스토어 정보 (documentCount, documents)
   */
  async getStoreInfo(storeName) {
    const docs = await this.listDocuments(storeName);
    return {
      storeName,
      documentCount: docs.length,
      documents: docs
    };
  }
}

module.exports = FileSearchManager;
