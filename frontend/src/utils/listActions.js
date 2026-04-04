import { showConfirm, showAlert } from '@/utils/modal';

export const handleDeleteItem = ({ api, url, label, onSuccess }) => {
    showConfirm('삭제', `"${label}" 을(를) 삭제하시겠습니까?`, async () => {
        try {
            await api.delete(url);
            showAlert('success', '삭제 완료', '삭제되었습니다.', onSuccess);
        } catch (err) {
            showAlert('error', '오류', '삭제에 실패했습니다.');
        }
    });
};