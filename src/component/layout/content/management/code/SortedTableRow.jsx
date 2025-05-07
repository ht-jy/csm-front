import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

/**
 * @description: 테이블의 순서를 변경하기 위해 사용하는 컴포넌트
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-04-15
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * - 라이브러리 사용
 *     @dnd-kit/sortable: 순서 정렬 설정
 *     @dnd-kit/utilities: CSS 적용 
 * 
 */
const SortedTableRow = ({item}) => {

    const {
        attributes, // aria 등 drag 관련 속성
        listeners, // onPointerDown 등 drag 이벤트 리스너
        setNodeRef, // 해당 DOM 요소를 등록하는 함수(드래그 타겟)
        transform, // 현재 위치 이동값(x, y)
        transition, // 애니메이션 트랜지션 정보
        isDragging, // 현재 드래그 중인지 여부(스타일링에 유용)
    } = useSortable({id: item})
    
    return (
        <tr
        ref={setNodeRef}
        style={{
            transform: CSS.Transform.toString(transform),
            transition,
            zIndex: isDragging ? '100' : undefined,
        }}
        >
            <td {...attributes} {...listeners} className="center"><i className="fa-solid fa-arrows-up-down-left-right"></i></td>
            <td>{item.code_set.code}</td>
            <td>{item.code_set.code_nm}</td>
            <td style={{ justifyItems: 'center' }}> <div className="square" style={{ backgroundColor: `${item.code_set.code_color}` }}></div></td>
            <td>{item.code_set.udf_val_03}</td>
            <td>{item.code_set.udf_val_04}</td>
            <td>{item.code_set.udf_val_05}</td>
            <td>{item.code_set.udf_val_06}</td>
            <td>{item.code_set.udf_val_07}</td>
            <td>{item.code_set.etc}</td>
            <td className="center">{item.code_set.is_use}</td>
            <td className="center">
            </td>
        </tr>
    )       
}

export default SortedTableRow;